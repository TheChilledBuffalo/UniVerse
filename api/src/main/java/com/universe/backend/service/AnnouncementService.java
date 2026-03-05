package com.universe.backend.service;

import com.universe.backend.dto.AnnouncementResponse;
import com.universe.backend.dto.CreateAnnouncementRequest;
import com.universe.backend.dto.UpdateAnnouncementRequest;
import com.universe.backend.entity.Announcement;
import com.universe.backend.entity.User;
import com.universe.backend.repository.AnnouncementRepository;
import com.universe.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public AnnouncementResponse createAnnouncement(Long adminId, CreateAnnouncementRequest request) {
        User admin = userRepository.findById(adminId).orElseThrow(() -> new RuntimeException("Admin not found"));

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .postedBy(admin)
                .build();

        announcementRepository.save(announcement);

        return mapToResponse(announcement);
    }

    public List<AnnouncementResponse> getAllAnnouncements() {

        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public AnnouncementResponse getAnnouncement(Long id) {

        Announcement announcement =
                announcementRepository.findById(id).orElseThrow(() -> new RuntimeException("Announcement not found"));

        return mapToResponse(announcement);
    }

    public void deleteAnnouncement(Long id) {

        Announcement announcement =
                announcementRepository.findById(id).orElseThrow(() -> new RuntimeException("Announcement not found"));

        announcementRepository.delete(announcement);
    }

    public AnnouncementResponse updateAnnouncement(Long id, UpdateAnnouncementRequest request) {
        Announcement announcement =
                announcementRepository.findById(id).orElseThrow(() -> new RuntimeException("Announcement not found"));

        if (request.getTitle() != null) {
            announcement.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            announcement.setContent(request.getContent());
        }

        announcement.setUpdatedAt(LocalDateTime.now());

        announcementRepository.save(announcement);

        return mapToResponse(announcement);
    }

    private AnnouncementResponse mapToResponse(Announcement announcement) {
        return AnnouncementResponse.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .postedBy(announcement.getPostedBy().getName())
                .createdAt(announcement.getCreatedAt())
                .updatedAt(announcement.getUpdatedAt())
                .build();
    }
}
