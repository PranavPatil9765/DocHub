package com.example.DocHub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class VerifyOtpRequest {

    @JsonProperty("email") private String email;
  @JsonProperty("otp")  private String otp;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
