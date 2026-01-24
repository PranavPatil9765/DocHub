package com.example.DocHub.controller;

// FileController.java
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.example.DocHub.dto.request.FileIdsRequest;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.service.FileDownloadService;
import com.example.DocHub.service.TelegramService;
import com.example.DocHub.utils.UserUtil;

import java.io.File;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FileDownloadController {

    private final FileDownloadService fileDownloadService;
    private final FileRepository fileRepository;

    @PostMapping("/download")
    public void downloadMultipleFiles(
            @RequestBody FileIdsRequest request,
            HttpServletResponse response) {

        List<UUID> fileIds = request.getFileIds();

        // ✅ 1. Validate FIRST
        if (fileIds == null || fileIds.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        List<FileEntity> files = fileRepository.findAllById(fileIds);

        if (files.size() != fileIds.size()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // ✅ 2. Only now write headers
        response.setContentType("application/zip");
        response.setHeader(
                "Content-Disposition",
                "attachment; filename=\"documents.zip\"");

        // ✅ 3. Stream safely
        try (ZipOutputStream zipOut = new ZipOutputStream(response.getOutputStream())) {

            for (FileEntity file : files) {

                if (file.getTelegramFileId() == null) {
                    continue;
                }

                String fileUrl = fileDownloadService.getFileDownloadUrl(
                        file.getTelegramFileId());

                try (InputStream in = new URL(fileUrl).openStream()) {

                    String filenameFromUrl = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

                    String extension = "";

                    int dotIndex = filenameFromUrl.lastIndexOf(".");
                    if (dotIndex != -1) {
                        extension = filenameFromUrl.substring(dotIndex);
                    }

                    String filename = (file.getName() != null ? file.getName() : file.getId().toString())
                            + extension;

                    if (filename == null || filename.isBlank()) {
                        filename = file.getId().toString();
                    }

                    zipOut.putNextEntry(new ZipEntry(filename));
                    in.transferTo(zipOut);
                    zipOut.closeEntry();
                }
            }

            zipOut.finish();
            response.flushBuffer(); // 🔥 IMPORTANT

        } catch (Exception e) {
            // ❌ DO NOT throw exception here
            // Response is already streaming
            // Just log
            e.printStackTrace();
        }
    }

    @GetMapping("/download/{fileId}")
    public void downloadSingleFile(
            @PathVariable("fileId") UUID fileId,
            HttpServletResponse response) {
        try {
            // 1️⃣ Get Telegram download URL
            FileEntity file = fileRepository
                    .findById(fileId)
                    .orElseThrow(() -> new AppException.ResourceNotFoundException("File not found"));
            String fileUrl = fileDownloadService.getFileDownloadUrl(file.getTelegramFileId());

            // 2️⃣ Extract filename from URL
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

            // 3️⃣ Set headers (force download)
            response.setContentType("application/octet-stream");
            response.setHeader(
                    "Content-Disposition",
                    "attachment; filename=\"" + filename + "\"");
            response.setHeader("Accept-Ranges", "bytes");

            // 4️⃣ Stream file to browser
            try (InputStream in = new URL(fileUrl).openStream()) {
                in.transferTo(response.getOutputStream());
            }

            response.flushBuffer();

        } catch (Exception e) {
            throw new AppException.InternalServerError("Single file download failed");
        }
    }
}
