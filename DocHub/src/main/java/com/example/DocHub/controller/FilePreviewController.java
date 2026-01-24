package com.example.DocHub.controller;

// FilePreviewController.java
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.service.FileDownloadService;
import com.example.DocHub.utils.UserUtil;

import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Optional;
import java.util.UUID;
@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FilePreviewController {

    private final FileDownloadService fileDownloadService;
    private final FileRepository fileRepository;

    @GetMapping("/preview/{fileId}")
    public void previewFile(
            @PathVariable("fileId") UUID fileId,
            HttpServletResponse response
    ) {
        try {
            FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() ->
                    new AppException.ResourceNotFoundException("File not found")
                );

            String telegramFileId = file.getTelegramFileId();
            String fileUrl = fileDownloadService.getFileDownloadUrl(telegramFileId);

            // 🔥 Decide content-type ourselves (DO NOT trust URLConnection)
            String contentType = resolveContentType(file.getName());

            response.setContentType(contentType);
            response.setHeader(
                "Content-Disposition",
                "inline; filename=\"" + file.getName() + "\""
            );
            response.setHeader("Accept-Ranges", "bytes");

            URL url = new URL(fileUrl);
            try (InputStream in = url.openStream()) {
                in.transferTo(response.getOutputStream());
            }

            response.flushBuffer();

        } catch (Exception e) {
            throw new AppException.InternalServerError("File preview failed");
        }
    }

    // ✅ THIS IS THE KEY
    private String resolveContentType(String filename) {
        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

        return switch (ext) {
            case "pdf" -> "application/pdf";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "txt" -> "text/plain";
            case "html" -> "text/html";
            default -> "application/octet-stream"; // downloads (correct)
        };
    }
}
