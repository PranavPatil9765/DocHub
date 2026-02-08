package com.example.DocHub.service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.DocHub.exception.AppException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TagGenerationService {

    @Value("${groq.api-key}")
    private String groqApiKey;

    private final ObjectMapper mapper = new ObjectMapper();

    /* ================== PUBLIC API ================== */

    public List<String> generateTags(Path filePath,String fileName) {
        System.out.println("GROQ KEY = " + groqApiKey);
        try {
            String extractedText = extractText(filePath);

            if (extractedText.length() < 10) {
         List<String> temptags = new ArrayList<>();
            temptags.add(fileName);
            return temptags;
            }

            String rawResponse = callGroq(extractedText);
            List<String> tags = parseTags(rawResponse);

            // optional: remove first noisy tag
            if (!tags.isEmpty()) {
                tags = tags.subList(1, tags.size());
            }

            return tags;

        } catch (Exception e) {
            throw new AppException.BadRequestException("Tag generation failed"+e.getMessage());
        }
    }

    /* ================== TEXT EXTRACTION ================== */

    private String extractText(Path file) throws Exception {
        Tika tika = new Tika();
        return tika.parseToString(file.toFile()).trim();
    }

    /* ================== GROQ API ================== */

    private String callGroq(String text) throws Exception {

        WebClient client = WebClient.builder()
                .baseUrl("https://api.groq.com/openai/v1/chat/completions")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + groqApiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> body = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", List.of(Map.of(
                        "role", "user",
                        "content",
                        """
                        Extract 10–30 short, relevant tags from the text below.
                        Return ONLY a valid JSON array of strings.

                        Text:
                        %s
                        """.formatted(text.substring(0, Math.min(2000, text.length()))))),
                "max_tokens", 200,
                "temperature", 0.3
        );

        String response = client.post()
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode root = mapper.readTree(response);
        return root.path("choices").get(0)
                .path("message")
                .path("content")
                .asText("[]");
    }

    /* ================== TAG PARSER ================== */

    private List<String> parseTags(String raw) {

        if (raw == null || raw.isBlank()) return List.of();

        String text = raw.replaceAll("```json|```", "").trim();

        // 1️⃣ Try direct JSON
        try {
            List<String> parsed = mapper.readValue(
                    text, new TypeReference<List<String>>() {});
            return clean(parsed);
        } catch (Exception ignored) {}

        // 2️⃣ Extract JSON array
        Matcher m = Pattern.compile("\\[[\\s\\S]*?]").matcher(text);
        if (m.find()) {
            try {
                List<String> parsed = mapper.readValue(
                        m.group(), new TypeReference<List<String>>() {});
                return clean(parsed);
            } catch (Exception ignored) {}
        }

        // 3️⃣ Fallback split
        String[] parts = text.contains("\n")
                ? text.split("\n")
                : text.split(",");

        return clean(Arrays.asList(parts));
    }

    private List<String> clean(List<String> input) {
        return input.stream()
                .map(t -> t.replaceAll("^[-*\\d.]+\\s*", "")
                        .replaceAll("^['\"\\s]+|['\"\\s,]+$", "")
                        .trim())
                .filter(t -> t.length() > 2)
                .distinct()
                .limit(30)
                .toList();
    }
}
