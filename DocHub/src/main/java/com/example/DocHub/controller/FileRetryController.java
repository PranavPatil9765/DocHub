package com.example.DocHub.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.example.DocHub.dto.Enums.FileStatus;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.utils.FileQueuePublisher;
import com.example.DocHub.utils.TagQueuePublisher;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FileRetryController {

    private final FileRepository fileRepository;
    private final FileQueuePublisher fileQueuePublisher;
    private final TagQueuePublisher tagQueuePublisher;

    /* -------------------- RETRY SINGLE FILE -------------------- */

    @PostMapping("/retry/{fileId}")
    @Transactional
    public void retryFile(@PathVariable UUID fileId) {

        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() ->
                        new AppException.ResourceNotFoundException("File not found"));
        // 🔁 CASE 1: Telegram upload already done → retry TAGGING ONLY
        if (file.getTelegramFileId() != null) {

            file.setStatus(FileStatus.TAG_GENERATION);
            file.setErrorMessage(null);
            fileRepository.save(file);

            tagQueuePublisher.publish(file.getId());
            return;
        }

        // 🔁 CASE 2: Upload never completed → retry full upload
        resetForUploadRetry(file);
        fileQueuePublisher.publish(file.getId());
    }

    /* -------------------- RETRY ALL FAILED FILES -------------------- */

    @PostMapping("/retry-failed")
    public int retryAllFailed() {

        List<FileEntity> failedFiles =
                fileRepository.findByStatus(FileStatus.FAILED);

        failedFiles.forEach(file -> {

            if (file.getTelegramFileId() != null) {
                file.setStatus(FileStatus.TAG_GENERATION);
                file.setErrorMessage(null);
                fileRepository.save(file);

                tagQueuePublisher.publish(file.getId());
            } else {
                resetForUploadRetry(file);
                fileQueuePublisher.publish(file.getId());
            }
        });

        return failedFiles.size();
    }

    /* -------------------- HELPERS -------------------- */

    private void resetForUploadRetry(FileEntity file) {
        file.setStatus(FileStatus.QUEUED);
        file.setErrorMessage(null);
        file.setUploadProgress(0);
        fileRepository.save(file);
    }
}
