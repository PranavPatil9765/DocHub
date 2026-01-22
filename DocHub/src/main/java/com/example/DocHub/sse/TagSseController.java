package com.example.DocHub.sse;

import java.util.UUID;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
public class TagSseController {

    private final SseEmitterRegistry registry;

    @GetMapping("/{fileId}")
    public SseEmitter subscribe(@PathVariable("fileId") UUID fileId) {
        return registry.add(fileId);
    }
}
