package com.example.DocHub.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DocHub.dto.request.UpdateFileRequest;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.FileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileUpdateService {

    private final FileRepository fileRepository;

    @Transactional
    public void updateFiles(UUID userId, List<UpdateFileRequest> updates) {

        if (updates == null || updates.isEmpty()) {
            return;
        }

        for (UpdateFileRequest req : updates) {

            FileEntity file = fileRepository
                    .findByIdAndUser_Id(req.getId(), userId)
                    .orElseThrow(() ->
                            new AppException.ResourceNotFoundException("File not found: " + req.getId())
                    );

            applyPartialUpdate(file, req);
            fileRepository.save(file);
        }
    }

    /* ---------- PARTIAL UPDATE ---------- */

    private void applyPartialUpdate(FileEntity file, UpdateFileRequest req) {

        if (req.getName() != null) {
            file.setName(req.getName());
        }

        if (req.getDescription() != null) {
            file.setDescription(req.getDescription());
        }

        if (req.getTags() != null) {
            file.setTags(req.getTags());
        }

        if (req.getIsFavourite() != null) {
            file.setFavourite(req.getIsFavourite());
        }
    }
}
