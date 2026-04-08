import { components } from "@universe/api-types";
import { BookOpen, ChevronRight, Users } from "lucide-react";
import Link from "next/link";

type Course = components["schemas"]["CourseResponse"];

type CourseCardProps = {
  course: Course;
};

export default function CourseCard({ course }: CourseCardProps) {
  // Generate a consistent hue from the course id for the gradient
  const hues = [240, 270, 300, 220, 200, 280];
  const hue = hues[(course.id ?? 0) % hues.length] ?? 240;

  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="
        flex flex-col overflow-hidden rounded-2xl border border-border bg-white
        shadow-sm transition-all duration-200
        group-hover:-translate-y-0.5 group-hover:shadow-md
      ">
        {/* Color stripe */}
        <div
          className="h-2 w-full"
          style={{
            background: `linear-gradient(90deg, hsl(${hue}, 70%, 55%), hsl(${hue + 40}, 70%, 65%))`,
          }}
        />
        <div className="p-5">
          {/* Course code badge */}
          <span
            className="
              inline-block rounded-lg px-2.5 py-1 text-xs font-semibold
            "
            style={{
              background: `hsl(${hue}, 70%, 95%)`,
              color: `hsl(${hue}, 60%, 40%)`,
            }}
          >
            {course.courseCode}
          </span>

          <h3 className="
            mt-3 line-clamp-2 leading-snug font-bold text-foreground
            transition-colors
            group-hover:text-primary
          ">
            {course.name}
          </h3>

          {course.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted">
              {course.description}
            </p>
          )}

          <div className="
            mt-4 flex items-center justify-between border-t border-border pt-3
          ">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <BookOpen size={13} />
              <span>{course.teacherName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Users size={13} />
              <span>{course.maxStudents} max</span>
            </div>
            <ChevronRight
              size={16}
              className="
                text-muted transition-colors
                group-hover:text-primary
              "
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
