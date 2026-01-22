package com.example.DocHub.repository;

import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.entity.User;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface FileRepository extends JpaRepository<FileEntity, UUID> {

    /* ================= SEARCH ================= */
@Query(value = """
  SELECT *
FROM (
    SELECT f.*,
      (
        ts_rank_cd(f.search_vector, plainto_tsquery('english', :query)) * 5 +
        similarity(unaccent(lower(f.name)), unaccent(lower(:query))) * 3 +
        similarity(unaccent(lower(f.description)), unaccent(lower(:query))) * 1
      ) AS rank_score
    FROM files f
    WHERE f.user_id = :userId

    AND (
      :query IS NULL
      OR length(trim(:query)) = 0
      OR f.search_vector @@ plainto_tsquery('english', :query)
      OR unaccent(lower(f.name)) ILIKE '%' || unaccent(lower(:query)) || '%'
      OR unaccent(lower(f.description)) ILIKE '%' || unaccent(lower(:query)) || '%'
      OR similarity(unaccent(lower(f.name)), unaccent(lower(:query))) > 0.35
      OR similarity(unaccent(lower(f.description)), unaccent(lower(:query))) > 0.30
    )

    AND (:fileType IS NULL OR f.file_type = :fileType)
    AND (:favourite IS NULL OR f.is_favourite = :favourite)
    AND (:minSize IS NULL OR f.file_size >= :minSize)
    AND (:maxSize IS NULL OR f.file_size <= :maxSize)

    AND (
      CAST(:cursorTime AS timestamp) IS NULL OR
      f.uploaded_at < CAST(:cursorTime AS timestamp) OR
      (
        f.uploaded_at = CAST(:cursorTime AS timestamp)
        AND f.id < CAST(:cursorId AS uuid)
      )
    )
) ranked
ORDER BY
  CASE
    WHEN :query IS NOT NULL AND length(trim(:query)) > 0
      THEN ranked.rank_score
    ELSE NULL
  END DESC,
  ranked.uploaded_at DESC,
  ranked.id DESC

    """,
    nativeQuery = true)
List<FileEntity> searchFiles(
    @Param("userId") UUID userId,
    @Param("query") String query,
    @Param("fileType") String fileType,
    @Param("favourite") Boolean favourite,
    @Param("minSize") Long minSize,
    @Param("maxSize") Long maxSize,
    @Param("cursorTime") LocalDateTime cursorTime,
    @Param("cursorId") UUID cursorId,
    Pageable pageable
);

    /* ================= OWNERSHIP ================= */

    Optional<FileEntity> findByIdAndUser_Id(UUID id, UUID userId);

    List<FileEntity> findByIdIn(List<UUID> ids);

    List<FileEntity> findByIdInAndUser_Id(List<UUID> ids, UUID userId);

    /* ================= SUGGESTIONS ================= */

    @Query(value = """
        SELECT *
        FROM files f
        WHERE f.user_id = :userId
        AND (
            LOWER(f.name) LIKE LOWER(CONCAT(:query, '%'))
            OR LOWER(f.partial_search_text) LIKE LOWER(CONCAT('%', :query, '%'))
        )
        ORDER BY f.uploaded_at DESC
        LIMIT 10
        """, nativeQuery = true)
    List<FileEntity> searchSuggestions(
            @Param("userId") UUID userId,
            @Param("query") String query
    );

 List<FileEntity> findTop4ByUser_IdOrderByUploadedAtDesc(UUID userId);

    /* =============================
       FAVOURITES
    ============================== */
    List<FileEntity> findTop4ByUser_IdAndIsFavouriteTrueOrderByUploadedAtDesc(UUID userId);

    /* =============================
       TOTAL FILE COUNT
    ============================== */
    long countByUser_Id(UUID userId);

    /* =============================
       TOP TAGS (Postgres)
    ============================== */
    @Query(value = """
        SELECT tag, COUNT(*) AS count
        FROM files f,
             unnest(f.tags) tag
        WHERE f.user_id = :userId
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 10
    """, nativeQuery = true)
    List<Object[]> topTags(@Param("userId") UUID userId);

    /* =============================
       ANALYTICS BY FILE TYPE
       (count + storage used)
    ============================== */
    @Query("""
        SELECT f.fileType,
               COUNT(f),
               COALESCE(SUM(f.fileSize), 0)
        FROM FileEntity f
        WHERE f.user.id = :userId
        GROUP BY f.fileType
    """)
    List<Object[]> analyticsByFileType(@Param("userId") UUID userId);

    /* =============================
       TOTAL STORAGE USED
    ============================== */
    @Query("""
        SELECT COALESCE(SUM(f.fileSize), 0)
        FROM FileEntity f
        WHERE f.user.id = :userId
    """)
    long totalStorage(@Param("userId") UUID userId);


  @Query(value = """
    SELECT
        DATE(f.uploaded_at) AS day,
        COALESCE(SUM(f.file_size), 0) AS total
    FROM files f
    WHERE f.user_id = :userId
    GROUP BY day
    ORDER BY day
""", nativeQuery = true)
List<Object[]> storageUsedByDate(@Param("userId") UUID userId);


List<FileEntity> findByUserAndFileType(
        User user,
        String file_type
);

List<FileEntity> findByUserAndIsFavouriteTrue(User user);

}
