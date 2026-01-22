package com.example.DocHub.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.example.DocHub.dto.TelegramUploadResult;

import org.springframework.http.*;
import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TelegramService {

    @Value("${telegram.bot-token}")
    private String botToken;

    // Telegram channel or chat ID
    @Value("${telegram.channel-id}")
    private String channelId;

    private final RestTemplate restTemplate = new RestTemplate();

    public TelegramUploadResult upload(String filePath, String filename) {

        File file = new File(filePath);
        if (!file.exists()) {
            throw new IllegalArgumentException("File not found at path: " + filePath);
        }

        String url = "https://api.telegram.org/bot" + botToken + "/sendDocument";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("chat_id", channelId);
        body.add("document", new FileSystemResource(file));
        body.add("caption", filename);

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(url, request, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Telegram upload failed");
        }

        Map<?, ?> result = (Map<?, ?>) response.getBody().get("result");
        Map<?, ?> document = (Map<?, ?>) result.get("document");

        // Telegram can return Integer or Long
        Number fileSizeNumber = (Number) document.get("file_size");
        Long fileSize = fileSizeNumber != null ? fileSizeNumber.longValue() : null;

        return new TelegramUploadResult(
                (String) document.get("file_id"),
                fileSize
        );
    }
}

