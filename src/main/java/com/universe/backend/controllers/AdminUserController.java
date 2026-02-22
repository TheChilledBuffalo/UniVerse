package com.universe.backend.controllers;

import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import com.universe.backend.entity.User;
import com.universe.backend.enums.Department;
import com.universe.backend.enums.Role;
import com.universe.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Create single user
    @PostMapping
    public User createUser(@Valid @RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setMustChangePassword(true);

        return userRepository.save(user);
    }

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Delete user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }

    @PostMapping("/bulk")
    public String uploadUsersFromCsv(@RequestParam("file") MultipartFile file) {

        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
            String line;

            // skip header
            reader.readLine();

            while ((line = reader.readLine()) != null) {

                String[] data = line.split(",");

                User user = new User();
                user.setName(data[0]);
                user.setEmail(data[1]);
                user.setPassword(passwordEncoder.encode(data[2]));
                user.setRole(Role.valueOf(data[3]));
                user.setDepartment(Department.valueOf(data[4]));
                user.setMustChangePassword(true);

                if (userRepository.findByEmail(user.getEmail()).isEmpty()) {
                    userRepository.save(user);
                }
            }

            return "Users uploaded successfully";

        } catch (Exception e) {
            throw new RuntimeException("Error processing file");
        }
    }

}