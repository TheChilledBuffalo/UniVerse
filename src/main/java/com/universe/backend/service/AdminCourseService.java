package com.universe.backend.service;

import com.universe.backend.dto.CourseResponse;
import com.universe.backend.dto.CreateCourseRequest;
import com.universe.backend.dto.UpdateCourseRequest;
import com.universe.backend.entity.Course;
import com.universe.backend.entity.User;
import com.universe.backend.enums.Role;
import com.universe.backend.repository.CourseRepository;
import com.universe.backend.repository.UserRepository;
import com.universe.backend.utils.CsvUtil;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseResponse createCourse(CreateCourseRequest request) {

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (teacher.getRole() != Role.TEACHER) {
            throw new RuntimeException("User is not a teacher");
        }

        Course course = Course.builder()
                .name(request.getName())
                .courseCode(request.getCourseCode())
                .description(request.getDescription())
                .teacher(teacher)
                .maxStudents(request.getMaxStudents() != null ? request.getMaxStudents() : 70)
                .build();

        courseRepository.save(course);

        return mapToResponse(course);
    }

    @Transactional
    public List<CourseResponse> createCourses(MultipartFile file) {
        return CsvUtil.readLines(file)
                .stream()
                .map(this::parseCourseLine)
                .map(courseRepository::save)
                .map(this::mapToResponse)
                .toList();
    }

    public CourseResponse updateCourse(Long id, UpdateCourseRequest request) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (request.getName() != null) {
            course.setName(request.getName());
        }
        if (request.getCourseCode() != null) {
            course.setCourseCode(request.getCourseCode());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if (request.getMaxStudents() != null) {
            course.setMaxStudents(request.getMaxStudents());
        }
        if (request.getTeacherId() != null) {
            User teacher = userRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            if (teacher.getRole() != Role.TEACHER) {
                throw new RuntimeException("User is not a teacher");
            }

            course.setTeacher(teacher);
        }

        courseRepository.save(course);

        return mapToResponse(course);
    }

    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        courseRepository.delete(course);
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CourseResponse mapToResponse(@NonNull Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .name(course.getName())
                .courseCode(course.getCourseCode())
                .description(course.getDescription())
                .teacherName(course.getTeacher().getName())
                .maxStudents(course.getMaxStudents())
                .build();
    }

    private Course parseCourseLine(String line) {

        // Expected CSV format:
        // name,courseCode,description,teacherId,maxStudents

        String[] parts = line.split(",");

        if (parts.length < 4)
            throw new RuntimeException("Invalid CSV format. Expected: name,courseCode,description,teacherId[,maxStudents]");

        String name = parts[0].trim();
        String courseCode = parts[1].trim();
        String description = parts[2].trim();
        Long teacherId = Long.parseLong(parts[3].trim());

        Integer maxStudents =
                parts.length > 4
                        ? Integer.parseInt(parts[4].trim())
                        : 70;

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException(
                        "Teacher not found: " + teacherId));

        if (teacher.getRole() != Role.TEACHER) {
            throw new RuntimeException("User is not a teacher: " + teacherId);
        }

        return Course.builder()
                .name(name)
                .courseCode(courseCode)
                .description(description)
                .teacher(teacher)
                .maxStudents(maxStudents)
                .build();
    }
}
