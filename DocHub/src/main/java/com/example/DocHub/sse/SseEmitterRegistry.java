package com.example.DocHub.sse;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
public class SseEmitterRegistry {

    private final Map<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter add(UUID fileId) {
        SseEmitter emitter = new SseEmitter(5 * 60 * 1000L); // 5 min
        emitters.put(fileId, emitter);

        emitter.onCompletion(() -> emitters.remove(fileId));
        emitter.onTimeout(() -> emitters.remove(fileId));
        emitter.onError(e -> emitters.remove(fileId));

        return emitter;
    }

  public void send(UUID fileId, String eventName, Object data) {
    SseEmitter emitter = emitters.get(fileId);
    if (emitter == null) return;

    try {
        emitter.send(
            SseEmitter.event()
                .name(eventName)
                .data(data)
        );
    } catch (Exception e) {
        emitter.completeWithError(e);
        emitters.remove(fileId);
    }
}

}

