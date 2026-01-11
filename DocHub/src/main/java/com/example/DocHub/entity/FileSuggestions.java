package com.example.DocHub.entity;

import java.util.UUID;


public record FileSuggestions(
    UUID id,
    String name,
    String fileType
) {}
