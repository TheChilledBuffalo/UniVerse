package com.universe.backend.service;

import com.universe.backend.entity.User;
import com.universe.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Constructor Injection
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Create single user
    public User createUser(User user) {
        return userRepository.save(user);
    }

    // Create bulk users
    public List<User> createUsersBulk(List<User> users) {
        return userRepository.saveAll(users);
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Delete user
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}