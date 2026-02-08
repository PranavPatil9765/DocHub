package com.example.DocHub.utils;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.Semaphore;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.example.DocHub.dto.TelegramUploadResult;
import com.example.DocHub.dto.Enums.FileStatus;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.service.PdfThumbnailService;
import com.example.DocHub.service.TelegramService;
import com.example.DocHub.sse.SseEmitterRegistry;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TelegramUploadWorker {

    private final FileRepository fileRepository;
    private final TelegramService telegramService;
    private final TagQueuePublisher tagQueuePublisher;
    private final SseEmitterRegistry sseEmitterRegistry;
    private final PdfThumbnailService thumbnailService;

    // 🔥 GLOBAL LIMITER (Only 1 file processing at a time)
    private static final Semaphore PROCESS_LIMIT = new Semaphore(1);

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
            // 🔥 Acquire processing slot
            PROCESS_LIMIT.acquire();

            String thumbnailString = thumbnailService.generateThumbnail(
                    file.getTempFilePath(),
                    file.getName());

            TelegramUploadResult telegramUploadResult = telegramService.upload(
                    file.getTempFilePath(),
                    file.getName());

            String telegramFileId = telegramUploadResult.fileId();

            file.setTelegramFileId(telegramFileId);
            file.setStatus(FileStatus.TAG_GENERATION);
            file.setThumbnailLink(thumbnailString);

            fileRepository.save(file);

            // ✅ SUCCESS SSE
            sseEmitterRegistry.send(
                    fileId,
                    "file-uploaded",
                    thumbnailString != null ? thumbnailString : ""
            );

            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            tagQueuePublisher.publish(fileId);
                        }
                    });

        } catch (Exception e) {

            file.setStatus(FileStatus.FAILED);
            file.setErrorMessage("Upload failed: " + e.getMessage());
            fileRepository.save(file);

            sseEmitterRegistry.send(
                    fileId,
                    "file-failed",
                    Map.of(
                            "status", "FAILED",
                            "error", e.getMessage()));

        } finally {
            // 🔥 Always release slot
            PROCESS_LIMIT.release();
        }
    }
}