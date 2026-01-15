package com.example.DocHub.service;

import com.example.DocHub.dto.TelegramUploadResult;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.entity.User;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.repository.UserRepository;
import com.example.DocHub.utils.FileTypeUtil;
import com.example.DocHub.utils.StorageLimit;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final TelegramService telegramService;
    private final PdfThumbnailService pdfThumbnailService;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    public ApiResponse upload(
            MultipartFile multipartFile,
            User user,
            List<String> tags,
            String description,
            String icon) throws Exception {

        /* 1️⃣ Save temp file */
        File tempFile = File.createTempFile("dochub_", multipartFile.getOriginalFilename());
        multipartFile.transferTo(tempFile);

        long fileSize = multipartFile.getSize();

        if (user.getStorageUsedBytes() + fileSize > StorageLimit.MAX_STORAGE_BYTES) {
            throw new AppException.ForbiddenException("Storage limit exceeded (20 GB)");
        }

        try {
            TelegramUploadResult telegram;
                telegram = telegramService.sendDocument(
                        multipartFile.getOriginalFilename(),
                        tempFile);
                System.out.println("✅ Telegram returned: " + telegram);
           

            /* 3️⃣ Generate thumbnail if PDF */
            String thumbnailUrl = null;
            System.out.println("Content type:" + multipartFile.getContentType());
            String filename = multipartFile.getOriginalFilename();

           if (filename != null) {
                thumbnailUrl = pdfThumbnailService.generateThumbnail(tempFile, filename);
            }

            /* 4️⃣ Save metadata in DB */
            FileEntity entity = FileEntity.builder()
                    .id(UUID.randomUUID())
                    .user(user)
                    .telegramFileId(telegram.fileId())
                    .thumbnailLink(thumbnailUrl)
                    .name(multipartFile.getOriginalFilename())
                    .description(description)
                    .tags(tags)
                    .fileType(FileTypeUtil
                        .getFileType(multipartFile.getOriginalFilename())
                    )
                    .fileSize(multipartFile.getSize())
                    .isFavourite(false)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            // ✅ UPDATE USER STORAGE
            user.setStorageUsedBytes(user.getStorageUsedBytes() + fileSize);
            userRepository.save(user);

            fileRepository.save(entity);
            return (new ApiResponse<>(true,"file Uploaded Successfully",null));

        } finally {
            /* 5️⃣ Cleanup */

            Files.deleteIfExists(tempFile.toPath());
        }
    }
}
