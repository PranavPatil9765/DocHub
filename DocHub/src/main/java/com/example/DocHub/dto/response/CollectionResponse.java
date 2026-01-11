package com.example.DocHub.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.example.DocHub.entity.CollectionEntity;
import com.example.DocHub.entity.FileEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CollectionResponse {

    private UUID id;
    private String name;
    private String description;
    private String icon;
    private List<UUID> fileIds;
    private LocalDateTime createdAt;

    public static CollectionResponse from(CollectionEntity entity) {

        List<UUID> fileIds = entity.getFiles() == null
                ? List.of()
                : entity.getFiles()
                        .stream()
                        .map(FileEntity::getId)
                        .toList();

        return CollectionResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .icon(entity.getIcon())
                .fileIds(fileIds)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
