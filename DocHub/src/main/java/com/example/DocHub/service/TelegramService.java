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

    // ✅ Keep as String (Telegram IDs can exceed Integer range)
    @Value("${telegram.channel-id}")
    private String channelId;

    private final RestTemplate restTemplate = new RestTemplate();

    public TelegramUploadResult sendDocument(String filename, File file) {

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

        Map result = (Map) response.getBody().get("result");
        Map document = (Map) result.get("document");

        // ✅ SAFE conversion (Integer OR Long)
        Number fileSizeNumber = (Number) document.get("file_size");
        Long fileSize = fileSizeNumber != null ? fileSizeNumber.longValue() : null;

        return new TelegramUploadResult(
                (String) document.get("file_id"),
                fileSize
        );
    }
}
