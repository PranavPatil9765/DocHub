package com.example.DocHub.utils;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.example.DocHub.dto.TelegramUploadResult;
import com.example.DocHub.dto.Enums.FileStatus;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.service.TelegramService;
import com.example.DocHub.sse.SseEmitterRegistry;

import jakarta.transaction.Transactional;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TelegramUploadWorker {

    private final FileRepository fileRepository;
    private final TelegramService telegramService;
    private final TagQueuePublisher tagQueuePublisher;
    private final SseEmitterRegistry sseEmitterRegistry;
    @Transactional
    @RabbitListener(queues = "file-processing-queue")
    public void uploadToTelegram(String fileIdStr) {

        UUID fileId;
        try {
            fileId = UUID.fromString(fileIdStr);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid fileId received: " + fileIdStr);
            return;
        }

        Optional<FileEntity> optionalFile = fileRepository.findById(fileId);

        if (optionalFile.isEmpty()) {
            System.out.println("File not found for id " + fileId);
            return;
        }

        FileEntity file = optionalFile.get();

        try {
            // Upload to Telegram
            TelegramUploadResult telegramUploadResult =
                    telegramService.upload(file.getTempFilePath(), file.getName());

            String telegramFileId = telegramUploadResult.fileId();

            // Update file
            file.setTelegramFileId(telegramFileId);
            file.setStatus(FileStatus.TAG_GENERATION);
            fileRepository.save(file);

            // ✅ SUCCESS SSE
            sseEmitterRegistry.send(
                fileId,
                "file-uploaded",
                Map.of("status", "FILE_UPLOADED")
            );

            TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                tagQueuePublisher.publish(fileId);
            }
            }
        );
        } catch (Exception e) {

            // ❌ UPDATE STATUS
            file.setStatus(FileStatus.FAILED);
            file.setErrorMessage("Upload failed: " + e.getMessage());
            fileRepository.save(file);

            // ❌ FAILURE SSE (NEW)
            sseEmitterRegistry.send(
                fileId,
                "file-failed",
                Map.of(
                    "status", "FAILED",
                    "error", e.getMessage()
                )
            );
        }
    }
}
