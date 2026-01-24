package com.example.DocHub.controller;

import com.example.DocHub.dto.request.AddFilesToCollectionRequest;
import com.example.DocHub.dto.request.CollectionRequest;
import com.example.DocHub.dto.request.CollectionsIdsRequest;
import com.example.DocHub.dto.request.FileIdsRequest;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.dto.response.CollectionResponse;
import com.example.DocHub.dto.response.CollectionWithFilesResponse;
import com.example.DocHub.entity.CollectionEntity;
import com.example.DocHub.security.CustomUserDetails;
import com.example.DocHub.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService service;

    /* CREATE */
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody CollectionRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    /* GET ALL */
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getUserCollections());
    }

    /* GET COLLECTION + FILE IDS */
    @GetMapping("/{collectionId}")
    public ResponseEntity<CollectionWithFilesResponse> getOne(
            @PathVariable("collectionId") UUID collectionId) {
        return ResponseEntity.ok(service.getCollectionWithFiles(collectionId));
    }


    /* GET COLLECTION + FILE IDS */
    @GetMapping("/default/{collectionName}")
    public ResponseEntity<CollectionWithFilesResponse> getDefault(
            @PathVariable("collectionName") String collectionName) {
        return ResponseEntity.ok(service.getDefaultCollection(collectionName));
    }

   /* DELETE MULTIPLE COLLECTIONS */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteMultiple(
            @RequestBody CollectionsIdsRequest request
    ) {
        return ResponseEntity.ok(
             service.deleteCollections(request.getCollectionIds())
        );
    }


    /* UPDATE */
    @PutMapping("/{collectionId}")
    public ResponseEntity<?> update(
            @PathVariable("collectionId") UUID collectionId,
            @RequestBody CollectionRequest req) {
        return ResponseEntity.ok(service.update(collectionId, req));
    }

    /* REMOVE MULTIPLE FILES FROM COLLECTION */
    @PostMapping("/{collectionId}/files/remove")
    public ResponseEntity<?> removeFiles(
            @PathVariable("collectionId") UUID collectionId,
            @RequestBody FileIdsRequest request) {
        service.removeFiles(collectionId, request.getFileIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{collectionId}/files")
    public ApiResponse<?> addFilesToCollection(
            @PathVariable("collectionId") UUID collectionId,
            @RequestBody AddFilesToCollectionRequest request) {
        return service.addFilesToCollection(collectionId, request.getFileIds());
    }

}
