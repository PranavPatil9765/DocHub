package com.example.DocHub.utils;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.example.DocHub.dto.TelegramUploadResult;
import com.example.DocHub.dto.Enums.FileStatus;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.service.TelegramService;
import com.example.DocHub.sse.SseEmitterRegistry;

import lombok.RequiredArgsConstructor;
@Component
@RequiredArgsConstructor
public class TelegramUploadWorker {

    private final FileRepository fileRepository;
    private final TelegramService telegramService;
    private final TagQueuePublisher tagQueuePublisher;
    private final SseEmitterRegistry sseEmitterRegistry;

    @RabbitListener(queues = "file-processing-queue")
    public void uploadToTelegram(String fileIdStr) {

        UUID fileId;
        try {
            fileId = UUID.fromString(fileIdStr);
        } catch (IllegalArgumentException e) {
            // ❌ invalid UUID → skip message
            System.err.println("Invalid fileId received: " + fileIdStr);
            return;
        }

        System.out.println(fileId + " searching .............");

        Optional<FileEntity> optionalFile = fileRepository.findById(fileId);

        if (optionalFile.isEmpty()) {
            System.out.println("File not found for id " + fileId + ". Skipping Telegram upload.");
            return; // ✅ ACK message, no retry
        }

        FileEntity file = optionalFile.get(); // ✅ CORRECT TYPECAST

        try {
            // Upload to Telegram (slow operation)
            TelegramUploadResult telegramUploadResult =
                    telegramService.upload(file.getTempFilePath(), file.getName());

            String telegramFileId = telegramUploadResult.fileId();

            // Update file
            file.setTelegramFileId(telegramFileId);
            file.setStatus(FileStatus.TAG_GENERATION);
            fileRepository.save(file);

            // Notify client
            sseEmitterRegistry.send(
                fileId,
                "file-uploaded",
                Map.of("status", "FILE_UPLOADED")
            );

            // Trigger tag generation
            tagQueuePublisher.publish(fileId);

        } catch (Exception e) {
            file.setStatus(FileStatus.FAILED);
            file.setErrorMessage("Upload failed: " + e.getMessage());
            fileRepository.save(file);
        }
    }
}
