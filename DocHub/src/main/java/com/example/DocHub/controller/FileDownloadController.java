package com.example.DocHub.controller;
// FileController.java
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.example.DocHub.dto.request.DownloadRequest;
import com.example.DocHub.service.FileDownloadService;
import com.example.DocHub.service.TelegramService;

import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FileDownloadController {

    private final FileDownloadService fileDownloadService;

    @PostMapping("/download")
    public void downloadMultipleFiles(
            @RequestBody DownloadRequest request,
            HttpServletResponse response
    ) {
        try {
            List<String> fileIds = request.getFileIds();

            response.setContentType("application/zip");
            response.setHeader(
                    "Content-Disposition",
                    "attachment; filename=\"documents.zip\""
            );

            ZipOutputStream zipOut = new ZipOutputStream(response.getOutputStream());

            for (String fileId : fileIds) {
                String fileUrl = fileDownloadService.getFileDownloadUrl(fileId);

                try (InputStream in = new URL(fileUrl).openStream()) {

                    String filename = fileId + ".bin";
                    ZipEntry entry = new ZipEntry(filename);
                    zipOut.putNextEntry(entry);

                    in.transferTo(zipOut);
                    zipOut.closeEntry();
                }
            }

            zipOut.finish();
            zipOut.close();

        } catch (Exception e) {
            throw new RuntimeException("Failed to download files", e);
        }
    }

     @GetMapping("/download/{fileId}")
    public void downloadSingleFile(
            @PathVariable String fileId,
            HttpServletResponse response
    ) {
        try {
            // 1️⃣ Get Telegram download URL
            String fileUrl = fileDownloadService.getFileDownloadUrl(fileId);

            // 2️⃣ Extract filename from URL
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

            // 3️⃣ Set headers (force download)
            response.setContentType("application/octet-stream");
            response.setHeader(
                    "Content-Disposition",
                    "attachment; filename=\"" + filename + "\""
            );
            response.setHeader("Accept-Ranges", "bytes");

            // 4️⃣ Stream file to browser
            try (InputStream in = new URL(fileUrl).openStream()) {
                in.transferTo(response.getOutputStream());
            }

            response.flushBuffer();

        } catch (Exception e) {
            throw new RuntimeException("Single file download failed", e);
        }
    }
}
