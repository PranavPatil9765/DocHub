package com.example.DocHub.utils;

import java.util.UUID;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TagQueuePublisher {

    private final RabbitTemplate rabbitTemplate;
    private static final String QUEUE = "tag-generation-queue";

    public void publish(UUID fileId) {
        rabbitTemplate.convertAndSend(QUEUE, fileId.toString());
    }
}
