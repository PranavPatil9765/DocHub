package com.example.DocHub.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.DocHub.dto.request.FileIdsRequest;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.entity.User;
import com.example.DocHub.security.CustomUserDetails;
import com.example.DocHub.service.FileDeleteService;
import com.example.DocHub.utils.UserUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/files")
@RequiredArgsConstructor
public class FileDeleteController {

    private final FileDeleteService fileService;

    /* DELETE MULTIPLE FILES */
    @PostMapping("/delete")
    public ResponseEntity<?> deleteFiles(
            @RequestBody FileIdsRequest request
    ) {
        User user = UserUtil.getCurrentUser();
        fileService.deleteFiles(user.getId(), request.getFileIds());
        return ResponseEntity.ok( new ApiResponse<>(true, "File deleted Successfully", null) );
    }

}
