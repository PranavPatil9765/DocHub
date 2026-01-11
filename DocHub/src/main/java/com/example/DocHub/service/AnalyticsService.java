package com.example.DocHub.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import com.example.DocHub.dto.response.AnalyticsResponse;
import com.example.DocHub.dto.response.FileResponse;
import com.example.DocHub.dto.response.FileTypeAnalytics;
import com.example.DocHub.dto.response.StorageChart;
import com.example.DocHub.dto.response.TagCountResponse;
import com.example.DocHub.dto.response.UploadStatsResponse;
import com.example.DocHub.entity.User;
import com.example.DocHub.repository.CollectionRepository;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.utils.UserUtil;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

        private final FileRepository fileRepository;
        private final CollectionRepository collectionRepository;

        /* 1️⃣ Recent uploads (top 4) */
        public List<FileResponse> getRecentUploads() {
                User user = UserUtil.getCurrentUser();

                return fileRepository
                                .findTop4ByUser_IdOrderByUploadedAtDesc(user.getId())
                                .stream()
                                .map(FileResponse::from)
                                .toList();
        }

        /* 2️⃣ Top 10 tags */
        public List<TagCountResponse> getTopTags() {
                User user = UserUtil.getCurrentUser();

                return fileRepository
                                .topTags(user.getId())
                                .stream()
                                .map(r -> new TagCountResponse(
                                                (String) r[0],
                                                ((Number) r[1]).longValue()))
                                .toList();
        }

        /* 3️⃣ Favourite files (top 4) */
        public List<FileResponse> getFavourites() {
                User user = UserUtil.getCurrentUser();

                return fileRepository
                                .findTop4ByUser_IdAndIsFavouriteTrueOrderByUploadedAtDesc(user.getId())
                                .stream()
                                .map(FileResponse::from)
                                .toList();
        }

        /* 4️⃣ Upload statistics */
        public UploadStatsResponse getUploadStats() {
                User user = UserUtil.getCurrentUser();

                return new UploadStatsResponse(
                                fileRepository.countByUser_Id(user.getId()),
                                collectionRepository.countByUser_Id(user.getId()));
        }

        /* 5️⃣ Analytics (fileType, count, storage, totalStorage) */
        public AnalyticsResponse getAnalytics() {

                User user = UserUtil.getCurrentUser();

                List<FileTypeAnalytics> perType = fileRepository
                                .analyticsByFileType(user.getId())
                                .stream()
                                .map(row -> FileTypeAnalytics.builder()
                                                .fileType((String) row[0])
                                                .fileCount(((Number) row[1]).longValue())
                                                .storageUsed(((Number) row[2]).longValue())
                                                .build())
                                .toList();

                long totalStorage = fileRepository.totalStorage(user.getId());

                return AnalyticsResponse.builder()
                                .totalStorage(totalStorage)
                                .byFileType(perType)
                                .build();
        }

        public List<StorageChart> getStorageChart() {

                User user = UserUtil.getCurrentUser();

               return fileRepository.storageUsedByDate(user.getId())
        .stream()
        .map((Object[] row) -> new StorageChart(
                ((java.sql.Date) row[0]).toLocalDate(),
                ((Number) row[1]).longValue()
        ))
        .toList();


        }

}
