package com.example.DocHub.utils;

import java.util.UUID;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FileQueuePublisher {

    private final RabbitTemplate rabbitTemplate;

    private static final String QUEUE_NAME = "file-processing-queue";

    public void publish(UUID fileId) {
        rabbitTemplate.convertAndSend(QUEUE_NAME, fileId.toString());
    }
}
