package com.universe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordTokenRequest {

    @NotBlank
    private String token;

    @NotBlank
    private String newPassword;
}
