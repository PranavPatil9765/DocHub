package com.example.DocHub.service;

import com.example.DocHub.dto.*;
import com.example.DocHub.dto.Enums.SortDirection;
import com.example.DocHub.dto.request.FileSearchRequest;
import com.example.DocHub.dto.response.FileResponse;
import com.example.DocHub.dto.response.ScrollResponse;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.entity.FileSuggestions;
import com.example.DocHub.repository.FileRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileSearchService {

    private final FileRepository repository;
 @Transactional(readOnly = true)
public ScrollResponse<FileResponse> search(
        UUID userId,
        FileSearchRequest req,
        LocalDateTime cursorTime,
        UUID cursorId,
        int limit
) {

    Pageable pageable = PageRequest.of(
            0,
            limit + 1
    );

    List<FileEntity> data = repository.searchFiles(
            userId,
            req.getQuery(),
            req.getFileType(),
            req.getFavourite(),
            req.getMinSize(),
            req.getMaxSize(),
            cursorTime,
            cursorId,
            pageable
    );

    boolean hasMore = data.size() > limit;
    if (hasMore) {
        data = data.subList(0, limit);
    }

    FileEntity last = data.isEmpty() ? null : data.get(data.size() - 1);

    // ✅ MAP TO DTOs
    List<FileResponse> items = data.stream()
            .map(FileResponse::from)
            .toList();

    return new ScrollResponse<>(
            items,   // ✅ DTOs ONLY
            hasMore,
            last != null ? last.getUploadedAt() : null,
            last != null ? last.getId() : null
    );
}


// private Sort buildSort(FileSearchRequest req) {

// //     Sort.Direction dir = req.getSortDir() == SortDirection.ASC
// //             ? Sort.Direction.ASC
// //             : Sort.Direction.DESC;

// //     return switch (req.getSortBy()) {
// //         case SIZE -> Sort.by(dir, "file_size");
// //         case NAME -> Sort.by(dir, "name");
// //         case UPLOADED_AT -> Sort.by(dir, "uploaded_at");
// //     };
// return Sort.by(Sort.Direction.DESC, "uploaded_at", "id");

// }

    public List<FileSuggestions> getSuggestions(UUID userId, String query) {

        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
    
        return repository.searchSuggestions(userId, query)
                .stream()
                .limit(4)
                .map(f -> new FileSuggestions(
                        f.getId(),
                        f.getName(),
                        f.getFileType()
                ))
                .toList();
    }
    

}

