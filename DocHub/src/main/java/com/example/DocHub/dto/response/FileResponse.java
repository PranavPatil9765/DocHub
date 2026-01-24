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
    private String type;
    private String description;
    private Long size;
    private String previewUrl;
    private boolean isFavourite;
    private List<String>tags;
    private LocalDateTime uploadedAt;
    private String status;

    public static FileResponse from(FileEntity file) {
        return FileResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .type(file.getFileType())
                .tags(file.getTags())
                .description(file.getDescription())
                .size(file.getFileSize())
                .previewUrl(file.getThumbnailLink())
                .isFavourite(file.isFavourite())
                .uploadedAt(file.getUploadedAt())
                .status(file.getStatus().toString())
                .build();
    }
}

