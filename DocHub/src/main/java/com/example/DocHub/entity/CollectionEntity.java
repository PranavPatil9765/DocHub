package com.example.DocHub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Entity
@Table(name = "collections")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionEntity {

    @Id
    @GeneratedValue
    @Column(name = "collection_id")
    private UUID id;

    /* MANY collections belong to ONE user */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;

    /* MANY collections ↔ MANY files */
    @ManyToMany
    @JoinTable(
        name = "collection_files",
        joinColumns = @JoinColumn(name = "collection_id"),
        inverseJoinColumns = @JoinColumn(name = "file_id")
    )
    private List<FileEntity> files;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
