package com.universe.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class UniVerseBackendApplication {

	@GetMapping("/")
	public String Hello() {
		return "Hi, the backend is running!";
	}

	public static void main(String[] args) {
		SpringApplication.run(UniVerseBackendApplication.class, args);
	}

}
