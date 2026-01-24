package com.example.DocHub.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.entity.User;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileDeleteService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    @Value("${dochub.storage.root}")
    private String storageRoot;

    @Transactional
    public void deleteFiles(UUID userId, List<UUID> fileIds) {

        if (fileIds == null || fileIds.isEmpty()) {
            System.out.println("fileIds are null");
            return;
        }

        // fetch only user's files
        List<FileEntity> files =
                fileRepository.findByIdInAndUser_Id(fileIds, userId);

       

        long totalBytes = files.stream()
                .mapToLong(f -> f.getFileSize() != null ? f.getFileSize() : 0L)
                .sum();

        Path rootPath = Paths.get(storageRoot).toAbsolutePath();
        Path tempDir = rootPath.resolve("temp");
        
        // 🔥 DELETE LOCAL FILES FIRST
        for (UUID fileId : fileIds) {
            Path tempFilePath = tempDir.resolve(fileId.toString());
            deleteLocalFile(tempFilePath);
        }

        // delete from DB
        fileRepository.deleteAll(files);

        // update user storage
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException.InternalServerError("User not found"));

        user.setStorageUsedBytes(
                Math.max(0, user.getStorageUsedBytes() - totalBytes)
        );

        userRepository.save(user);
    }

    private void deleteLocalFile(Path rootPath) {
        try {
            if (Files.exists(rootPath)) {
                Files.delete(rootPath);
            }
        } catch (IOException e) {
            // do NOT fail transaction
            System.err.println("Failed to delete local file");
        }
    }
}
