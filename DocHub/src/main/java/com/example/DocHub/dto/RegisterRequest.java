package com.example.DocHub.dto;

// import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public record RegisterRequest(
        @JsonProperty("email") String email,
        @JsonProperty("password") String password,
        @JsonProperty("fullName") String fullName
) {
}
