package com.example.DocHub.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.dto.response.AnalyticsResponse;
import com.example.DocHub.dto.response.FileResponse;
import com.example.DocHub.dto.response.StorageChart;
import com.example.DocHub.dto.response.TagCountResponse;
import com.example.DocHub.dto.response.UploadStatsResponse;
import com.example.DocHub.dto.response.UserResponse;
import com.example.DocHub.entity.User;
import com.example.DocHub.service.AnalyticsService;
import com.example.DocHub.utils.UserUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AnalyticsService service;

    /* 1️⃣ Analytics */
     @GetMapping("/user")
    public ApiResponse<UserResponse> getUser() {
                User user = UserUtil.getCurrentUser();
                UserResponse userresponse = new UserResponse(user.getEmail(),user.getFullName());
        return new ApiResponse<UserResponse>(
                true,
                "User fetched successfully",
                userresponse
        );
    }
    @GetMapping("/analytics")
    public ApiResponse<AnalyticsResponse> analytics() {
        return new ApiResponse<>(
                true,
                "Analytics fetched successfully",
                service.getAnalytics()
        );
    }

    /* 2️⃣ Top Tags */
    @GetMapping("/top-tags")
    public ApiResponse<List<TagCountResponse>> topTags() {
        return new ApiResponse<>(
                true,
                "Top tags fetched successfully",
                service.getTopTags()
        );
    }

    /* 3️⃣ Recent uploads */
    @GetMapping("/recent")
    public ApiResponse<List<FileResponse>> recentUploads() {
        return new ApiResponse<>(
                true,
                "Recent uploads fetched successfully",
                service.getRecentUploads()
        );
    }

    /* 4️⃣ Favourite files */
    @GetMapping("/favourites")
    public ApiResponse<List<FileResponse>> favourites() {
        return new ApiResponse<>(
                true,
                "Favourite files fetched successfully",
                service.getFavourites()
        );
    }

    /* 5️⃣ Upload stats */
    @GetMapping("/stats")
    public ApiResponse<UploadStatsResponse> uploadStats() {
        return new ApiResponse<>(
                true,
                "Upload stats fetched successfully",
                service.getUploadStats()
        );
    }
    @GetMapping("/storage-chart")
public com.example.DocHub.dto.response.ApiResponse<List<StorageChart>> storageChart() {

    return new com.example.DocHub.dto.response.ApiResponse<>(
            true,
            "Storage chart fetched",
            service.getStorageChart()
    );
}

}
