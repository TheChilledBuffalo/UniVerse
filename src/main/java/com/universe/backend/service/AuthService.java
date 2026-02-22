package com.universe.backend.service;

import com.universe.backend.dto.*;
import com.universe.backend.entity.User;
import com.universe.backend.repository.UserRepository;
import com.universe.backend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RevokedTokenService revokedTokenService;
    private final PasswordResetService passwordResetService;

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .mustChangePassword(user.getMustChangePassword())
                .build();
    }

    public void resetPassword(Long userId, ResetPasswordRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (Objects.equals(request.getCurrentPassword(), request.getNewPassword())) {
            throw new RuntimeException("New password cannot be the same as the current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        passwordResetService.createResetToken(request.getEmail());
    }

    public void resetPassword(ResetPasswordTokenRequest request) {
        passwordResetService.resetPassword(request);
    }

    public void logout(String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return;

        String token = authHeader.substring(7);
        revokedTokenService.revokeToken(token);
    }
}
