package com.universe.backend.dto;

import com.universe.backend.enums.Department;
import com.universe.backend.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeResponse {

    private String name;
    private String email;
    private Department department;
    private Role role;
}
