package com.example.DocHub.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

import com.example.DocHub.dto.Enums.FileSortBy;
import com.example.DocHub.dto.Enums.SortDirection;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileSearchRequest {

    @JsonProperty("query")
    private String query;          // full-text + partial search

    @JsonProperty("fileType")
    private String fileType;       // pdf, image, docx

    @JsonProperty("favourite")
    private Boolean favourite;

    @JsonProperty("minSize")
    private Long minSize;

    @JsonProperty("maxSize")
    private Long maxSize;

    @JsonProperty("startDate")
    private LocalDateTime startDate;

    @JsonProperty("endDate")
    private LocalDateTime endDate;

    @JsonProperty("sortBy")
    private FileSortBy sortBy = FileSortBy.UPLOADED_AT;

    @JsonProperty("sortDir")
    private SortDirection sortDir = SortDirection.DESC;

    @JsonProperty("cursorTime")
    private LocalDateTime cursorTime;
    
    @JsonProperty("cursorId")
    private UUID cursorId;
}
