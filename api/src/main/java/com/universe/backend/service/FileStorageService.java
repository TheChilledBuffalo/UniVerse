package com.universe.backend.service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
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

    public String getPresignedDownloadUrl(String fileUrl) {
        try {
            String objectName = extractObjectName(fileUrl);

            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucket)
                    .object(objectName)
                    .expiry(60 * 15)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate download URL", e);
        }
    }

    private String extractObjectName(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new RuntimeException("Invalid file URL");
        }

        String expectedPrefix = minioUrl + "/" + bucket + "/";
        if (fileUrl.startsWith(expectedPrefix)) {
            return fileUrl.substring(expectedPrefix.length());
        }

        int idx = fileUrl.lastIndexOf('/');
        if (idx >= 0 && idx < fileUrl.length() - 1) {
            return fileUrl.substring(idx + 1);
        }

        throw new RuntimeException("Invalid file URL");
    }
}
