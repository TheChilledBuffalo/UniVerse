package com.universe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForumPostRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String content;
}
