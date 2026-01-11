package com.example.DocHub.dto.request;
// DownloadRequest.java
import java.util.List;

public class DownloadRequest {
    private List<String> fileIds;

    public List<String> getFileIds() {
        return fileIds;
    }

    public void setFileIds(List<String> fileIds) {
        this.fileIds = fileIds;
    }
}
