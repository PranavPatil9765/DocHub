package com.example.DocHub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class StorageChart {

    private LocalDate date;
    private long storageUsed;
}
