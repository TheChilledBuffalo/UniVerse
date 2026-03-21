package com.universe.backend.dto.responses;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    @NotNull
    private Long id;

    @NotNull
    private String name;

    @NotNull
    private String email;

    @NotNull
    private String role;

    private String department;
}
