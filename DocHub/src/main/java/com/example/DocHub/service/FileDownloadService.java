package com.example.DocHub.service;

// TelegramService.java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class FileDownloadService {

    @Value("${telegram.bot-token}")
    private String botToken;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getFileDownloadUrl(String fileId) {
        String apiUrl =
            "https://api.telegram.org/bot" + botToken + "/getFile?file_id=" + fileId;

        Map<?, ?> response = restTemplate.getForObject(apiUrl, Map.class);
        Map<?, ?> result = (Map<?, ?>) response.get("result");

        String filePath = (String) result.get("file_path");

        return "https://api.telegram.org/file/bot" + botToken + "/" + filePath;
    }
}
