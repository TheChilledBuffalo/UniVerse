package com.universe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForumReplyRequest {
    @NotBlank
    private String content;
}
