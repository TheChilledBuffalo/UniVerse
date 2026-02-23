package com.universe.backend.service;

import com.universe.backend.dto.CreateUserRequest;
import com.universe.backend.dto.UpdateUserRequest;
import com.universe.backend.dto.UserResponse;
import com.universe.backend.entity.User;
import com.universe.backend.enums.Department;
import com.universe.backend.enums.Role;
import com.universe.backend.repository.UserRepository;
import com.universe.backend.utils.CsvUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        String defaultPassword = request.getEmail().split("@")[0] + "123";

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .role(request.getRole())
                .department(request.getDepartment())
                .password(passwordEncoder.encode(defaultPassword))
                .mustChangePassword(true)
                .build();

        userRepository.save(user);

        return mapToResponse(user);
    }

    @Transactional
    public List<UserResponse> createUsers(MultipartFile file) {
        return CsvUtil.readLines(file)
                .stream()
                .map(this::parseUserLine)
                .map(userRepository::save)
                .map(this::mapToResponse)
                .toList();
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setMustChangePassword(false);
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }

        userRepository.save(user);

        return mapToResponse(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .department(user.getDepartment() != null ? user.getDepartment().name() : null)
                .build();
    }

    private User parseUserLine(String line) {

        // Expected CSV format: name,email,role,department

        String[] parts = line.split(",");

        if (parts.length < 3)
            throw new RuntimeException("Invalid CSV format. Expected: name,email,role[,department]");

        String name = parts[0].trim();
        String email = parts[1].trim();
        String roleStr = parts[2].trim();
        String departmentStr = parts.length > 3 ? parts[3].trim() : "";

        String defaultPassword = email.split("@")[0] + "123";

        return User.builder()
                .name(name)
                .email(email)
                .role(Role.valueOf(roleStr.toUpperCase()))
                .department(departmentStr.isEmpty() ? null : Department.valueOf(departmentStr))
                .password(passwordEncoder.encode(defaultPassword))
                .mustChangePassword(true)
                .build();
    }
}
