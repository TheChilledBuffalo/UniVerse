package com.universe.backend.service;

import com.universe.backend.dto.EnrollmentRequest;
import com.universe.backend.dto.EnrollmentResponse;
import com.universe.backend.entity.Course;
import com.universe.backend.entity.Enrollment;
import com.universe.backend.entity.User;
import com.universe.backend.enums.Role;
import com.universe.backend.repository.CourseRepository;
import com.universe.backend.repository.EnrollmentRepository;
import com.universe.backend.repository.UserRepository;
import com.universe.backend.utils.CsvUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminEnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public EnrollmentResponse enrollStudent(EnrollmentRequest request) {

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("User is not a student");
        }

        if (enrollmentRepository.existsByStudentIdAndCourseId(
                student.getId(), course.getId())) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        long count = enrollmentRepository.countByCourseId(course.getId());
        if (count >= course.getMaxStudents()) {
            throw new RuntimeException("Course is full");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .build();

        enrollmentRepository.save(enrollment);

        return mapToResponse(enrollment);
    }

    public List<EnrollmentResponse> enrollStudents(MultipartFile file) {
        return CsvUtil.readLines(file)
                .stream()
                .map(this::parseEnrollmentLine)
                .map(enrollmentRepository::save)
                .map(this::mapToResponse)
                .toList();
    }

    public void removeEnrollment(Long studentId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollmentRepository.delete(enrollment);
    }

    public List<EnrollmentResponse> getStudentsInCourse(Long courseId) {

        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found");
        }

        return enrollmentRepository.findByCourseId(courseId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<EnrollmentResponse> getCoursesForStudent(Long studentId) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("User is not a student");
        }

        return enrollmentRepository.findByStudentId(studentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private Enrollment parseEnrollmentLine(String line) {

        // Expected CSV format: studentId,courseId

        String[] parts = line.split(",");
        if (parts.length != 2)
            throw new RuntimeException("Invalid line format: " + line);

        Long studentId = Long.parseLong(parts[0].trim());
        Long courseId = Long.parseLong(parts[1].trim());

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        if (student.getRole() != Role.STUDENT)
            throw new RuntimeException("User is not a student: " + studentId);

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId))
            throw new RuntimeException("Student is already enrolled in this course: " + studentId + " -> " + courseId);

        long count = enrollmentRepository.countByCourseId(courseId);
        if (count >= course.getMaxStudents())
            throw new RuntimeException("Course is full: " + courseId);

        return Enrollment.builder()
                .student(student)
                .course(course)
                .build();
    }

    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getId())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getName())
                .courseId(enrollment.getCourse().getId())
                .courseName(enrollment.getCourse().getName())
                .build();
    }
}
