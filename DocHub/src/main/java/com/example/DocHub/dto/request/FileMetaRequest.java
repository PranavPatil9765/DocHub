package com.example.DocHub.dto.request;

import java.util.List;

public record FileMetaRequest(
    List<String> tags,
    String description,
    String icon
) {}
