package com.example.DocHub.dto.response;


import com.example.DocHub.entity.FileEntity;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record CollectionWithFilesResponse(
        UUID collectionId,
        String name,
        String description,
        String icon,
        List<FileResponse> files,
        LocalDateTime createdAt
) {}
