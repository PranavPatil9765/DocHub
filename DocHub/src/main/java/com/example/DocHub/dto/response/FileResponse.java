package com.example.DocHub.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.example.DocHub.entity.FileEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FileResponse {

    private UUID id;
    private String name;
    private String fileType;
    private String description;
    private Long fileSize;
    private String thumbnailLink;
    private boolean isFavourite;
    private List<String>tags;
    private LocalDateTime uploadedAt;

    public static FileResponse from(FileEntity file) {
        return FileResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .fileType(file.getFileType())
                .tags(file.getTags())
                .description(file.getDescription())
                .fileSize(file.getFileSize())
                .thumbnailLink(file.getThumbnailLink())
                .isFavourite(file.isFavourite())
                .uploadedAt(file.getUploadedAt())
                .build();
    }
}

