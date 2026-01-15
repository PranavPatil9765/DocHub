package com.example.DocHub.dto.response;

import lombok.Builder;

@Builder
public record UserResponse(String email,String userName) {
    
}
