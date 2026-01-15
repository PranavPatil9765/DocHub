package com.example.DocHub.controller;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.exception.AppException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import net.sourceforge.tess4j.Tesseract;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.tika.Tika;

@RestController
@RequestMapping("/api/files/")
public class TagGenerationController {

    @Value("${groq.api-key}")
    private String groqApiKey;

    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping(value = "/generate-tags", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> generateTags(
            @RequestParam("file") MultipartFile file) {

        Path tempFile = null;

        try {
            if (file.isEmpty()) {
                throw new AppException.BadRequestException("Bad Request");
            }

            /* 1️⃣ Save temp file */
            tempFile = Files.createTempFile("upload-", file.getOriginalFilename());
            Files.write(tempFile, file.getBytes());

            String extractedText = extractText(tempFile);

            if (extractedText.length() < 30) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Not enough readable text"));
            }

            /* 2️⃣ Call GROQ */
            String rawResponse = callGroq(extractedText);

            /* 3️⃣ Parse tags safely */
            List<String> tags = parseTags(rawResponse);
            if (!tags.isEmpty()) {
                tags = tags.subList(1, tags.size());
            }

            return ResponseEntity.ok(new ApiResponse<List<String>>(true, "Tags Generated Successfully", tags));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Tag generation failed"));
        } finally {
            try {
                if (tempFile != null)
                    Files.deleteIfExists(tempFile);
            } catch (IOException ignored) {
            }
        }
    }

    /* -------------------- TEXT EXTRACTION -------------------- */

    public String extractText(Path file) throws Exception {
        Tika tika = new Tika();
        return tika.parseToString(file.toFile()).trim();
    }
    /* -------------------- GROQ API -------------------- */

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
                                Extract 25–30 short, relevant tags from the text below.
                                Return ONLY a valid JSON array of strings.

                                Text:
                                %s
                                """.formatted(text.substring(0, Math.min(2000, text.length()))))),
                "max_tokens", 200,
                "temperature", 0.3);

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

    /* -------------------- TAG PARSER (ROBUST) -------------------- */

    private List<String> parseTags(String raw) {
        if (raw == null || raw.isBlank())
            return List.of();

        String text = raw.replaceAll("```json|```", "").trim();

        /* 1️⃣ Try JSON directly */
        try {
            List<String> parsed = mapper.readValue(
                    text, new TypeReference<List<String>>() {
                    });
            return clean(parsed);
        } catch (Exception ignored) {
        }

        /* 2️⃣ Extract JSON array */
        Matcher m = Pattern.compile("\\[[\\s\\S]*?]").matcher(text);
        if (m.find()) {
            try {
                List<String> parsed = mapper.readValue(
                        m.group(), new TypeReference<List<String>>() {
                        });
                return clean(parsed);
            } catch (Exception ignored) {
            }
        }

        /* 3️⃣ Fallback split */
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
