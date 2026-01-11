package com.example.DocHub.dto.request;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateFileRequest {
    @JsonProperty("id")  UUID id;
    @JsonProperty("name") String name;
    @JsonProperty("description") String description;
    @JsonProperty("tags") List<String> tags;
    @JsonProperty("isFavourite") Boolean isFavourite;
    @JsonProperty("icon") String icon;
}

