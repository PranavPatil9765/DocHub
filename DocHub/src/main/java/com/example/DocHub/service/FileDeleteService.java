package com.example.DocHub.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.entity.User;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileDeleteService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    @Transactional
    public void deleteFiles(UUID userId, List<UUID> fileIds) {

        if (fileIds == null || fileIds.isEmpty()) {
            throw new IllegalArgumentException("File IDs list cannot be empty");
        }

        // fetch only user's files
        List<FileEntity> files = fileRepository.findByIdInAndUser_Id(fileIds, userId);

        if (files.isEmpty()) {
            return;
        }

        // calculate total size
        long totalBytes = files.stream()
        .mapToLong(f -> f.getFileSize() != null ? f.getFileSize() : 0L)
        .sum();


        // delete files
        fileRepository.deleteAll(files);

        // update user storage
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStorageUsedBytes(
                Math.max(0, user.getStorageUsedBytes() - totalBytes)
        );

        userRepository.save(user);
    }
}
