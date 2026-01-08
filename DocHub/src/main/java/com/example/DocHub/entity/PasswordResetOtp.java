package com.example.DocHub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_otp")
public class PasswordResetOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String otp;
    private LocalDateTime expiryTime;
    private boolean used = false;

    // ===== GETTERS =====

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getOtp() {
        return otp;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public boolean isUsed() {
        return used;
    }

    // ===== SETTERS =====

    public void setId(Long id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }
}
