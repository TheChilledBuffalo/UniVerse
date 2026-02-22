package com.universe.backend.service;

import com.universe.backend.dto.EmailDetails;
import com.universe.backend.dto.ResetPasswordTokenRequest;
import com.universe.backend.entity.PasswordResetToken;
import com.universe.backend.entity.User;
import com.universe.backend.repository.PasswordResetTokenRepository;
import com.universe.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${frontend.url}")
    private String frontendUrl;

    public void createResetToken(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String rawToken = UUID.randomUUID().toString();
        String tokenHash = hash(rawToken);

        tokenRepository.save(
                PasswordResetToken.builder()
                        .tokenHash(tokenHash)
                        .user(user)
                        .expiryDate(java.time.LocalDateTime.now().plusMinutes(15))
                        .build()
        );

        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;

        emailService.sendEmail(EmailDetails.builder()
                .to(user.getEmail())
                .subject("Password Reset Request")
                .body("Click the link to reset your password: " + resetLink)
                .build()
        );
    }

    public void resetPassword(ResetPasswordTokenRequest request) {

        String tokenHash = hash(request.getToken());

        PasswordResetToken token = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (token.getUsed())
            throw new RuntimeException("Token has already been used");

        if (token.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Token has expired");

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));

            return Base64.getEncoder().encodeToString(hashBytes);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
