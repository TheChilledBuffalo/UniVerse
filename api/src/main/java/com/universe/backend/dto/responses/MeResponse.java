package com.universe.backend.dto.responses;

import com.universe.backend.enums.Department;
import com.universe.backend.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeResponse {

    @NotNull
    private String name;

    @NotNull
    private String email;

    @NotNull
    private Department department;

    @NotNull
    private Role role;
}
