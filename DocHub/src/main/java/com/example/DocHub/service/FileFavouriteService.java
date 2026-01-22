package com.example.DocHub.service;

import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.entity.User;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.utils.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileFavouriteService {

    private final FileRepository fileRepository;

    /* ================= ADD ================= */

    @Transactional
    public void addToFavourite(List<UUID> fileIds) {

        User user = UserUtil.getCurrentUser();

        List<FileEntity> files = fileRepository
                .findByIdInAndUser_Id(fileIds, user.getId());

        if (files.isEmpty()) {
            throw new AppException.ResourceNotFoundException("No valid files found");
        }

        files.forEach(file -> file.setFavourite(true));

        fileRepository.saveAll(files);
    }

    /* ================= REMOVE ================= */

    @Transactional
    public void removeFromFavourite(List<UUID> fileIds) {

        User user = UserUtil.getCurrentUser();

        List<FileEntity> files = fileRepository
                .findByIdInAndUser_Id(fileIds, user.getId());

        if (files.isEmpty()) {
            throw new AppException.ResourceNotFoundException("No valid files found");
        }

        files.forEach(file -> file.setFavourite(false));

        fileRepository.saveAll(files);
    }
}
