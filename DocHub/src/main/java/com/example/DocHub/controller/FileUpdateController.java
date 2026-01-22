package com.example.DocHub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.DocHub.dto.request.UpdateFilesRequest;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.entity.User;
import com.example.DocHub.service.FileUpdateService;
import com.example.DocHub.utils.UserUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUpdateController {

    private final FileUpdateService fileUpdateService;

    @PostMapping("/update")
    public ResponseEntity<?> updateFiles(
            @RequestBody UpdateFilesRequest request
    ) {
        User user = UserUtil.getCurrentUser();

        fileUpdateService.updateFiles(user.getId(), request.files());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Files updated successfully", null)
        );
    }
}
