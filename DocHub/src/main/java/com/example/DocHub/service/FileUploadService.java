package com.example.DocHub.service;

import com.example.DocHub.dto.TelegramUploadResult;
import com.example.DocHub.dto.Enums.FileStatus;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.entity.User;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.repository.UserRepository;
import com.example.DocHub.sse.SseEmitterRegistry;
import com.example.DocHub.utils.FileQueuePublisher;
import com.example.DocHub.utils.FileTypeUtil;
import com.example.DocHub.utils.StorageLimit;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final FileQueuePublisher queuePublisher;
    private final PdfThumbnailService thumbnailService;
    private final SseEmitterRegistry sseEmitterRegistry;
    @Value("${dochub.storage.root}")
    private String storageRoot;

    @Transactional
    public ApiResponse upload(
            MultipartFile file,
            User user) {

        if (user.getStorageUsedBytes() + file.getSize() > StorageLimit.MAX_STORAGE_BYTES) {
            throw new AppException.BadRequestException("Storage limit exceeded (20 GB)");
        }

        UUID fileId = UUID.randomUUID();

        Path rootPath = Paths.get(storageRoot).toAbsolutePath();
        Path tempDir = rootPath.resolve("temp");
        Path tempFilePath = tempDir.resolve(fileId.toString());

        try {
            Files.createDirectories(tempDir);

            // ✅ Write file to deterministic path
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, tempFilePath, StandardCopyOption.REPLACE_EXISTING);
            }

            String thumbnailString = thumbnailService.generateThumbnail(tempFilePath, file.getOriginalFilename());

            FileEntity entity = FileEntity.builder()
                    .id(fileId)
                    .user(user)
                    .name(file.getOriginalFilename())
                    .fileType(FileTypeUtil.getFileType(file.getOriginalFilename()))
                    .fileSize(file.getSize())
                    .thumbnailLink(thumbnailString)
                    .tempFilePath(tempFilePath.toString())
                    .status(FileStatus.QUEUED)
                    .uploadProgress(100)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            fileRepository.save(entity);

            user.setStorageUsedBytes(user.getStorageUsedBytes() + file.getSize());
            userRepository.save(user);
            // ✅ Publish AFTER DB save
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            queuePublisher.publish(fileId);
                        }
                    });

            Map<String, Object> data = Map.of(
                    "fileId", fileId,
                    "thumbnailId", thumbnailString != null ? thumbnailString : "");
            return new ApiResponse<>(
                    true,
                    "File " + file.getOriginalFilename() + " queued for processing",
                    data);

        } catch (Exception e) {
            // ✅ delete ONLY the file, never the root
            try {
                Files.deleteIfExists(tempFilePath);
            } catch (IOException ignored) {
            }

            throw new RuntimeException("File upload failed", e);
        }
    }
}
