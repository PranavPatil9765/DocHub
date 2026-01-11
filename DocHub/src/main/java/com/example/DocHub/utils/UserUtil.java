package com.example.DocHub.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.DocHub.entity.User;
import com.example.DocHub.security.CustomUserDetails;

public final class UserUtil {

    private UserUtil() {
        // utility class
    }

    public static User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {
            throw new RuntimeException("Invalid authentication principal");
        }

        return userDetails.getUser();
    }
}
