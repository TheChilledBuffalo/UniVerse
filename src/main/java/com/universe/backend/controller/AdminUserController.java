package com.universe.backend.controller;

import com.universe.backend.entity.User;
import com.universe.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    // POST /admin/users
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // POST /admin/users/bulk
    @PostMapping("/bulk")
    public List<User> createUsersBulk(@RequestBody List<User> users) {
        return userService.createUsersBulk(users);
    }

    // GET /admin/users
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // DELETE /admin/users/{id}
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}