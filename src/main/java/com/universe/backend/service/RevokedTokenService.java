package com.universe.backend.service;

import com.universe.backend.entity.RevokedToken;
import com.universe.backend.repository.RevokedTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RevokedTokenService {

    private final RevokedTokenRepository revokedTokenRepository;

    public void revokeToken(String token) {

        revokedTokenRepository.save(
                RevokedToken.builder()
                        .token(token)
                        .revokedAt(LocalDateTime.now())
                        .build()
        );
    }

    public boolean isTokenRevoked(String token) {
        return revokedTokenRepository.existsByToken(token);
    }
}
