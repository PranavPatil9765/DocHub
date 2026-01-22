package com.example.DocHub.controller;

import com.example.DocHub.dto.*;
import com.example.DocHub.dto.request.FileSearchRequest;
import com.example.DocHub.dto.response.ScrollResponse;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.security.CustomUserDetails;
import com.example.DocHub.service.FileSearchService;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileSearchController {

        private final FileSearchService fileSearchService;

        @PostMapping("/search")
        public ResponseEntity<ScrollResponse<?>> searchFiles(
                        @RequestBody FileSearchRequest request,
                        @RequestParam(name = "limit", defaultValue = "15") int limit

        ) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();

                return ResponseEntity.ok(
                                fileSearchService.search(
                                                user.getId(),
                                                request,
                                                request.getCursorTime(),
                                                request.getCursorId(),
                                                limit));
        }

        @GetMapping("/search/suggestions")
        public ResponseEntity<?> searchSuggestions(
                        @RequestParam("q") String q) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
                return ResponseEntity.ok(
                                fileSearchService.getSuggestions(user.getId(), q));
        }

}
