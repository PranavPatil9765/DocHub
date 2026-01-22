package com.example.DocHub.dto.request;


import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {

    @NotBlank
    @JsonProperty("oldPassword") private String oldPassword;

    @NotBlank
    @JsonProperty("newPassword") private String newPassword;
}
