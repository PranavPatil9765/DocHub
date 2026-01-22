package com.example.DocHub.dto.Enums;

public enum FileStatus {
    QUEUED,    // worker running
    TAG_GENERATION,         // optional
    READY,                  // fully usable
    FAILED
}
