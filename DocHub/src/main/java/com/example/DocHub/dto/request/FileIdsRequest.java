package com.example.DocHub.dto.request;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class FileIdsRequest {
    @JsonProperty("fileIds") List<UUID> fileIds;
}

