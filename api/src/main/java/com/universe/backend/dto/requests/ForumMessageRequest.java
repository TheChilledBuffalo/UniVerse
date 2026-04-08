package com.universe.backend.dto.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForumMessageRequest {
    @NotBlank
    private String content;
}
