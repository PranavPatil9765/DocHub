package com.example.DocHub.controller;

import com.example.DocHub.dto.request.ChangePasswordRequest;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.entity.User;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.repository.UserRepository;
import com.example.DocHub.utils.UserUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/")
public class ChangePasswordController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        User user = UserUtil.getCurrentUser();

        // 🔐 1. Verify old password
        if (!passwordEncoder.matches(
                request.getOldPassword(),
                user.getPassword()
        )) {
            throw new AppException.BadRequestException("Old password is incorrect");
        }

        // 🔐 2. Prevent same password reuse
        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword()
        )) {
            throw new AppException.BadRequestException(
                    "New password must be different from old password"
            );
        }

        // 🔐 3. Encode & save new password
        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);

        return new ApiResponse<>(
                true,
                "Password changed successfully",
                null
        );
    }
}
