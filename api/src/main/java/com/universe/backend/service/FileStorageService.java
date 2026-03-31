package com.universe.backend.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.url}")
    private String minioUrl;

    public String uploadFile(MultipartFile file) {
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();

            minioClient.putObject(PutObjectArgs.builder().bucket(bucket).object(filename).stream(
                            file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

            return minioUrl + "/" + bucket + "/" + filename;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }
}
