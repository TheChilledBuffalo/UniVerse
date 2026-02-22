package com.universe.backend.controllers;

import com.universe.backend.dto.*;
import com.universe.backend.entity.User;
import com.universe.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/reset-password")
    public void resetPassword(@AuthenticationPrincipal User user, @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(user.getId(), request);
    }

    @GetMapping("/me")
    public MeResponse getCurrentUser(@AuthenticationPrincipal User user) {
        return MeResponse.builder()
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .build();
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
    }

    @PostMapping("/reset-password-token")
    public void resetPasswordWithToken(@Valid @RequestBody ResetPasswordTokenRequest request) {
        authService.resetPassword(request);
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader("Authorization") String authHeader) {
        authService.logout(authHeader);
    }
}
