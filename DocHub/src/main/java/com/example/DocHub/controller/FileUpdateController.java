package com.example.DocHub.controller;


import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.DocHub.dto.request.UpdateFileRequest;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUpdateController {

    private final FileRepository fileRepository;
    /**
     * UPDATE FILE METADATA
     */
    @PostMapping("/update")
    public ResponseEntity<?> updateFile(
            @RequestBody UpdateFileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        FileEntity file = fileRepository
                .findByIdAndUser_Id(request.getId(), user.getId())
                .orElseThrow(() -> new AppException.ResourceNotFoundException("File not found"));

        /* ---------- Partial Updates ---------- */

        if (request.getName() != null) {
            file.setName(request.getName());
        }

        if (request.getDescription() != null) {
            file.setDescription(request.getDescription());
        }

        if (request.getTags() != null) {
            file.setTags(request.getTags());
        }

        if (request.getIsFavourite() != null) {
            file.setFavourite(request.getIsFavourite());
        }


        /* ---------- Update Search Text ---------- */
        file.setPartialSearchText(buildSearchText(file));

        fileRepository.save(file);

        return ResponseEntity.ok(new ApiResponse<>(true, "File Saved Successfully", null));
    }

    /* ---------- SEARCH TEXT BUILDER ---------- */

    private String buildSearchText(FileEntity file) {
        StringBuilder sb = new StringBuilder();

        if (file.getName() != null)
            sb.append(file.getName()).append(" ");

        if (file.getDescription() != null)
            sb.append(file.getDescription()).append(" ");

        if (file.getTags() != null)
            sb.append(String.join(" ", file.getTags()));

        return sb.toString().toLowerCase();
    }
}
