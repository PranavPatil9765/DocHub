package com.example.DocHub.controller;

import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.entity.User;
import com.example.DocHub.security.CustomUserDetails;
import com.example.DocHub.service.FileUploadService;
import com.example.DocHub.utils.UserUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.parser.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(
            @RequestPart("file") MultipartFile file
            ) throws Exception {

        User user = UserUtil.getCurrentUser();
        // ObjectMapper mapper = new ObjectMapper();
        // List<String> tags = mapper.readValue(
        //         tagsJson,
        //         new TypeReference<List<String>>() {
        //         });
        return ResponseEntity.ok(
                fileUploadService.upload(file, user));
    }
}
