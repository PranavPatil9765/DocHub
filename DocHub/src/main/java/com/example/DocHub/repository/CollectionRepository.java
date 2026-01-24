package com.example.DocHub.repository;

import com.example.DocHub.entity.CollectionEntity;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectionRepository extends JpaRepository<CollectionEntity, UUID> {

    List<CollectionEntity> findByUser_id(UUID userId);

    Optional<CollectionEntity> findByIdAndUser_Id(UUID id, UUID userId);

    long countByUser_Id(UUID userId);

    /*
     * =============================
     * COLLECTION WITH FILES
     * (avoid LazyInitialization issues)
     * ==============================
     */

    @EntityGraph(attributePaths = "files")
    Optional<CollectionEntity> findWithFilesByIdAndUser_Id(UUID collectionId, UUID userId);

        List<CollectionEntity> findAllByIdInAndUserId(
                List<UUID> ids,
                UUID userId);
    

}
