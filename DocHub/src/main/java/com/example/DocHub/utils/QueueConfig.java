package com.example.DocHub.utils;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QueueConfig {

    @Bean
    public Queue fileProcessingQueue() {
        return new Queue("file-processing-queue", true); // durable
    }

    @Bean
    public Queue tagGenerationQueue() {
        return new Queue("tag-generation-queue", true); // durable
    }
}
