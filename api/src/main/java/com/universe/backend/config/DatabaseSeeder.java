package com.universe.backend.config;

import com.universe.backend.entity.User;
import com.universe.backend.enums.Role;
import com.universe.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default.email:admin@universe.edu}")
    private String defaultAdminEmail;

    @Value("${admin.default.password:admin123}")
    private String defaultAdminPassword;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Database is empty. Populating default ADMIN user...");

            User admin = User.builder()
                    .name("System Admin")
                    .email(defaultAdminEmail)
                    .role(Role.ADMIN)
                    .password(passwordEncoder.encode(defaultAdminPassword))
                    .mustChangePassword(true)
                    .build();

            userRepository.save(admin);

            log.info("Default Admin created successfully with email: {}", defaultAdminEmail);
        }
    }
}
