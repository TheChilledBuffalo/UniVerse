package com.universe.backend.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;

public final class CsvUtil {

    public static List<String> readLines(MultipartFile file) {
        try (BufferedReader reader =
                     new BufferedReader(new InputStreamReader(file.getInputStream()))) {

            return reader.lines()
                    .skip(1)
                    .toList();

        } catch (Exception e) {
            throw new RuntimeException("Failed to process file: " + e.getMessage());
        }
    }
}
