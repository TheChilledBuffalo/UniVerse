package com.universe.backend.dto;

import com.universe.backend.enums.Department;
import com.universe.backend.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String email;

    @NotNull
    private Role role;

    private Department department;
}
