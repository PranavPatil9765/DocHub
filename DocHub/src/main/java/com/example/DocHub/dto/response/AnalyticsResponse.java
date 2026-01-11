package com.example.DocHub.dto.response;

import lombok.Builder;
import java.util.List;

@Builder
public class AnalyticsResponse {

    private long totalStorage;
    private List<FileTypeAnalytics> byFileType;

    public long getTotalStorage() { return totalStorage; }
    public List<FileTypeAnalytics> getByFileType() { return byFileType; }
}
