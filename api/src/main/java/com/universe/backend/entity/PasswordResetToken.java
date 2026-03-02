package com.universe.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tokenHash;

    @ManyToOne
    private User user;

    private LocalDateTime expiryDate;

    @Builder.Default
    private Boolean used = false;
}
