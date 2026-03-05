package com.universe.backend.controllers;

import com.universe.backend.dto.AnnouncementResponse;
import com.universe.backend.dto.CreateAnnouncementRequest;
import com.universe.backend.dto.UpdateAnnouncementRequest;
import com.universe.backend.entity.User;
import com.universe.backend.service.AnnouncementService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public AnnouncementResponse createAnnouncement(
            @AuthenticationPrincipal User user, @Valid @RequestBody CreateAnnouncementRequest request) {
        return announcementService.createAnnouncement(user.getId(), request);
    }

    @GetMapping
    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementService.getAllAnnouncements();
    }

    @GetMapping("/{id}")
    public AnnouncementResponse getAnnouncement(@PathVariable Long id) {
        return announcementService.getAnnouncement(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AnnouncementResponse updateAnnouncement(
            @PathVariable Long id, @Valid @RequestBody UpdateAnnouncementRequest request) {
        return announcementService.updateAnnouncement(id, request);
    }
}
