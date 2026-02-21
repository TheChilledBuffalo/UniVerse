package com.universe.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailDetails {

    @Email
    @NotBlank
    private String to;

    @NotBlank
    private String subject;

    private String body;
}
