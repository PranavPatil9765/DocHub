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
          FileEntity file = fileRepository
        .findByIdAndUser_Id(fileId, UserUtil.getCurrentUser().getId())
        .orElseThrow(()-> new AppException.ResourceNotFoundException ("File not found"));

             String telegramFileId = file.getTelegramFileId(); // ✅ THIS
            System.out.println("fileId"+fileId);
            // 1️⃣ Get Telegram file URL
            String fileUrl = fileDownloadService.getFileDownloadUrl(telegramFileId);

            // 2️⃣ Extract filename
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

            // 3️⃣ Detect content type
            URL url = new URL(fileUrl);
            URLConnection connection = url.openConnection();
            String contentType = connection.getContentType();

            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // 4️⃣ Set headers for PREVIEW
            response.setContentType(contentType);
            response.setHeader(
                    "Content-Disposition",
                    "inline; filename=\"" + filename + "\""
            );
            response.setHeader("Accept-Ranges", "bytes");

            // 5️⃣ Stream file
            try (InputStream in = connection.getInputStream()) {
                in.transferTo(response.getOutputStream());
            }

            response.flushBuffer();

        } catch (Exception e) {
            throw new RuntimeException("File preview failed", e);
        }
    }
}
