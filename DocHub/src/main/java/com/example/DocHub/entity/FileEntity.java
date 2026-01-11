package com.example.DocHub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "files")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String telegramFileId;
    private String thumbnailLink;
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT[]")
    private List<String> tags;

    private String fileType;
    private Long fileSize;
    private boolean isFavourite;
    private LocalDateTime uploadedAt;

    @ManyToMany(mappedBy = "files")
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
