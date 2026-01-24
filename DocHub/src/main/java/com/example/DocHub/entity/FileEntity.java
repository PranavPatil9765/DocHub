package com.example.DocHub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.example.DocHub.dto.Enums.FileStatus;

@Entity
@Table(name = "files")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String telegramFileId;
    private String thumbnailLink;
    private String name;

    private Integer uploadProgress; // 0–100 (ONLY used during upload)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileStatus status;

     @Column(columnDefinition = "TEXT")
    private String tempFilePath;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT[]")
    private List<String> tags;

    private String fileType;
    private Long fileSize;
    private boolean isFavourite;
    private LocalDateTime uploadedAt;

     @OneToMany(
        mappedBy = "files",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<CollectionEntity> collections;

    @Column(columnDefinition = "tsvector", insertable = false, updatable = false)
    private String searchVector;

    @Column(columnDefinition = "TEXT")
    private String partialSearchText;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof FileEntity))
            return false;
        FileEntity that = (FileEntity) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

}
