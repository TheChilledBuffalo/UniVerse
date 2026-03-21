package com.universe.backend.dto.responses;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnnouncementResponse {

    @NotNull
    private Long id;

    @NotNull
    private String title;

    @NotNull
    private String content;

    @NotNull
    private String postedBy;

    @NotNull
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
