package com.example.DocHub.dto.request;


import lombok.Getter;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
public class AddFilesToCollectionRequest {
    @JsonProperty("fileIds") private List<UUID> fileIds;
}
