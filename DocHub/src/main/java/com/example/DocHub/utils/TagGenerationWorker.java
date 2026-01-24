package com.example.DocHub.utils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.DocHub.dto.Enums.FileStatus;
import com.example.DocHub.entity.FileEntity;
import com.example.DocHub.repository.FileRepository;
import com.example.DocHub.service.TagGenerationService;
import com.example.DocHub.sse.SseEmitterRegistry;

import lombok.RequiredArgsConstructor;
@Component
@RequiredArgsConstructor
public class TagGenerationWorker {

    private final FileRepository fileRepository;
    private final TagGenerationService tagService;
    private final SseEmitterRegistry sseRegistry;

    @Transactional
    @RabbitListener(queues = "tag-generation-queue")
    public void generateTags(String fileIdStr) {

        UUID fileId = UUID.fromString(fileIdStr);
        Optional<FileEntity> optionalFile = fileRepository.findById(fileId);
        if (optionalFile.isEmpty()) {
            System.out.println("File Not found -- id:"+fileIdStr);
            return; // ❌ stale message → ACK & drop
        }
        // ✅ Idempotency guard
        FileEntity file = optionalFile.get();
        if (file.getStatus() == FileStatus.READY) {
            return;
        }

        // ✅ Status guard
        if (file.getStatus() != FileStatus.TAG_GENERATION) {
            return;
        }

        try {
            Path filePath = Paths.get(file.getTempFilePath());

            List<String> aiTags = tagService.generateTags(filePath, file.getName());
            List<String> userTags = Optional
                    .ofNullable(file.getTags())
                    .orElse(Collections.emptyList());

            List<String> mergedTags = new ArrayList<>(aiTags);
            mergedTags.addAll(userTags);

            file.setTags(mergedTags);
            file.setStatus(FileStatus.READY);

            // 🧹 CLEANUP
            Files.deleteIfExists(filePath);
            file.setTempFilePath(null);
            fileRepository.save(file);

            // ✅ SUCCESS SSE
            sseRegistry.send(
                fileId,
                "tags-generated",
                mergedTags
            );

        } catch (Exception e) {

            file.setStatus(FileStatus.FAILED);
            file.setErrorMessage("Tag generation failed ");
            fileRepository.save(file);

            // ❌ FAILURE SSE (NEW)
            sseRegistry.send(
                fileId,
                "tags-failed",
                Map.of(
                    "status", "FAILED",
                    "error", file.getErrorMessage()
                )
            );
            return;
        }
    }
}
