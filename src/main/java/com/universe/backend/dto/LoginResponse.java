package com.universe.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {

    private String token;
    private String role;
    private Boolean mustChangePassword;
}
