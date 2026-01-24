package com.example.DocHub.service;

import com.example.DocHub.dto.request.CollectionRequest;
import com.example.DocHub.dto.request.CollectionsIdsRequest;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.dto.response.CollectionResponse;
import com.example.DocHub.dto.response.CollectionWithFilesResponse;
import com.example.DocHub.dto.response.FileResponse;
import com.example.DocHub.entity.CollectionEntity;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.entity.User;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.CollectionRepository;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.utils.UserUtil;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollectionService {

        private final CollectionRepository repository;
        private final FileRepository fileRepository;

        /* ================= CREATE COLLECTION ================= */

        @Transactional
        public ApiResponse<Void> create(CollectionRequest req) {

                User user = UserUtil.getCurrentUser();

                List<FileEntity> files = fileRepository
                                .findByIdInAndUser_Id(req.getFileIds(), user.getId());

                if (files.size() != req.getFileIds().size()) {
                        throw new AppException.ResourceNotFoundException("One or more files not found");
                }

                CollectionEntity entity = CollectionEntity.builder()
                                .user(user)
                                .name(req.getName())
                                .description(req.getDescription())
                                .icon(req.getIcon())
                                .files(files)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();

                repository.save(entity);

                return new ApiResponse<>(true, "Collection Created Successfully", null);
        }

        /* DELETE MULTIPLE COLLECTIONS */
        @Transactional
        public ApiResponse<Void> deleteCollections(List<UUID> collectionIds) {

                if (collectionIds == null || collectionIds.isEmpty()) {
                        throw new AppException.BadRequestException("Invalid Collection");
                }
                UUID userId = UserUtil.getCurrentUser().getId();
                List<CollectionEntity> collections = repository.findAllByIdInAndUserId(collectionIds,userId);

                if (collections.isEmpty()) {
                      throw new AppException.ResourceNotFoundException("Collection Not Found");
                }

                repository.deleteAll(collections);
                return new ApiResponse<Void>(true,"Collection Deleted Successfully", null);
        }

        /* ================= GET USER COLLECTIONS ================= */

        public ApiResponse<List<CollectionResponse>> getUserCollections() {

                User user = UserUtil.getCurrentUser();

                List<CollectionEntity> collections = repository.findByUser_id(user.getId());

                List<CollectionResponse> response = collections.stream()
                                .map(CollectionResponse::from)
                                .toList();

                return new ApiResponse<>(
                                true,
                                "Collections Fetched Successfully",
                                response);
        }

        /* ================= GET COLLECTION WITH FILES ================= */

        @Transactional(readOnly = true)
        public CollectionWithFilesResponse getCollectionWithFiles(UUID collectionId) {

                User user = UserUtil.getCurrentUser();

                CollectionEntity collection = repository
                                .findByIdAndUser_Id(collectionId, user.getId())
                                .orElseThrow(() -> new AppException.ResourceNotFoundException("Collection not found"));

                List<FileResponse> files = collection.getFiles()
                                .stream()
                                .map(FileResponse::from)
                                .toList();

                return CollectionWithFilesResponse.builder()
                                .collectionId(collection.getId())
                                .name(collection.getName())
                                .description(collection.getDescription())
                                .icon(collection.getIcon())
                                .files(files) // ✅ DTOs ONLY
                                .createdAt(collection.getCreatedAt())
                                .build();
        }

        /* ================= UPDATE COLLECTION ================= */

        @Transactional
        public ApiResponse<Void> update(UUID collectionId, CollectionRequest req) {

                User user = UserUtil.getCurrentUser();

                CollectionEntity entity = repository
                                .findByIdAndUser_Id(collectionId, user.getId())
                                .orElseThrow(() -> new AppException.ResourceNotFoundException("Collection not found"));

                entity.setName(req.getName());
                entity.setDescription(req.getDescription());
                entity.setIcon(req.getIcon());
                entity.setUpdatedAt(LocalDateTime.now());

                repository.save(entity);

                return new ApiResponse<>(true, "Collection Updated Successfully", null);
        }

        /* ================= REMOVE FILES FROM COLLECTION ================= */

        @Transactional
        public void removeFiles(UUID collectionId, List<UUID> fileIds) {

                User user = UserUtil.getCurrentUser();

                CollectionEntity collection = repository
                                .findByIdAndUser_Id(collectionId, user.getId())
                                .orElseThrow(() -> new AppException.ResourceNotFoundException("Collection not found"));

                collection.getFiles()
                                .removeIf(file -> fileIds.contains(file.getId()));
                repository.save(collection);
        }

        @Transactional
        public ApiResponse<?> addFilesToCollection(UUID collectionId, List<UUID> fileIds) {

                User user = UserUtil.getCurrentUser();

                CollectionEntity collection = repository
                                .findByIdAndUser_Id(collectionId, user.getId())
                                .orElseThrow(() -> new AppException.ResourceNotFoundException("Collection not found"));

                // Fetch files owned by user
                List<FileEntity> filesToAdd = fileRepository
                                .findByIdInAndUser_Id(fileIds, user.getId());

                if (filesToAdd.isEmpty()) {
                        throw new AppException.ResourceNotFoundException("No valid files found");
                }

                // Existing files in collection
                List<FileEntity> existingFiles = collection.getFiles();

                // Add only files that are NOT already present
                filesToAdd.stream()
                                .filter(file -> !existingFiles.contains(file))
                                .forEach(existingFiles::add);

                // No explicit save required, but safe
                repository.save(collection);
                return new ApiResponse<>(true, "File/s Added Successfully", null);

        }

        @Transactional(readOnly = true)
        public CollectionWithFilesResponse getDefaultCollection(
                        String collectionName) {

                User user = UserUtil.getCurrentUser();

                List<FileEntity> files;

                switch (collectionName) {

                        case "Images":
                                files = fileRepository.findByUserAndFileType(
                                                user,
                                                "IMAGE");
                                break;

                        case "Documents":
                                files = fileRepository.findByUserAndFileType(
                                                user,
                                                "DOCUMENT");
                                break;

                        case "Favourites":
                                files = fileRepository.findByUserAndIsFavouriteTrue(user);
                                break;

                        default:
                                throw new AppException.BadRequestException(
                                                "Invalid default collection: " + collectionName);
                }

                // ✅ Convert FileEntity → FileResponse
                List<FileResponse> fileResponses = files.stream()
                                .map(FileResponse::from)
                                .toList();

                // ✅ Virtual collection response
                return CollectionWithFilesResponse.builder()
                                .collectionId(null) // virtual
                                .name(collectionName)
                                .description("Default " + collectionName + " collection")
                                .icon("")
                                .files(fileResponses)
                                .createdAt(null)
                                .build();
        }

}
