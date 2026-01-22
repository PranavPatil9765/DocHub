package com.example.DocHub.dto.request;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateFilesRequest(
        @JsonProperty("files") List<UpdateFileRequest> files
) {}
