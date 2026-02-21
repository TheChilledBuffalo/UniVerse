package com.universe.backend.service;

import com.universe.backend.dto.EmailDetails;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendEmail(EmailDetails emailDetails) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(emailDetails.getTo());
            helper.setSubject(emailDetails.getSubject());
            helper.setText(emailDetails.getBody(), true);
            helper.setFrom("${spring.mail.username}", "UniVerse LMS");
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", emailDetails.getTo(), e.getMessage());
        }
    }
}
