"use client";

import CourseCard from "@/components/dashboard/CourseCard";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import api from "@/lib/api";
import { BookOpen, Search } from "lucide-react";
import { useState } from "react";

export default function CoursesPage() {
  const { data: courses, isLoading } = api.useQuery("get", "/courses");
  const [courseCode, setCourseCode] = useState("");

  const filteredCourses = courses?.filter(
    (c) =>
      c.courseCode.toLowerCase().includes(courseCode.trim().toLowerCase()) ||
      c.name.toLowerCase().includes(courseCode.trim().toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="My Courses"
        description="All courses you are enrolled in or teaching"
        action={
          <div className="relative flex gap-2">
            <div className="
              pointer-events-none absolute inset-y-0 left-0 flex items-center
              pl-3 text-muted
            ">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="
                w-full rounded-xl border border-border bg-white py-2 pr-3 pl-10
                text-sm
                focus:border-primary focus:ring-2 focus:ring-primary/20
                focus:outline-none
                sm:w-64
              "
            />
          </div>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="
            size-8 animate-spin rounded-full border-2 border-border
            border-t-primary
          " />
        </div>
      ) : !courses || courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="No courses yet"
          description="You are not enrolled in or assigned to any courses."
        />
      ) : filteredCourses?.length === 0 ? (
        <EmptyState
          icon={<Search size={32} />}
          title="No matching courses"
          description={`No courses matched "${courseCode}".`}
        />
      ) : (
        <div className="
          grid grid-cols-1 gap-5
          sm:grid-cols-2
          lg:grid-cols-3
        ">
          {filteredCourses?.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
