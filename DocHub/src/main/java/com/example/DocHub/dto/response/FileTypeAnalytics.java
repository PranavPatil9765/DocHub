package com.example.DocHub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileTypeAnalytics {

    private String fileType;
    private long fileCount;
    private long storageUsed;
}
