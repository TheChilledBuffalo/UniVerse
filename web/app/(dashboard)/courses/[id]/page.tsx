"use client";

import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import clsx from "clsx";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import AssignmentsPage from "./assignments/page";
import CourseForum from "./forum/page";
import CourseNotesPage from "./notes/page";

function CourseStudents({ courseId }: { courseId: number }) {
  const { data: students, isLoading } = api.useQuery(
    "get",
    "/courses/{id}/students",
    {
      params: { path: { id: courseId } },
    },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="
          size-6 animate-spin rounded-full border-2 border-border
          border-t-primary
        " />
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="
        rounded-2xl border border-border bg-white p-6 text-center shadow-sm
      ">
        <Users size={32} className="mx-auto mb-3 text-muted" />
        <h3 className="font-semibold text-foreground">No students enrolled</h3>
        <p className="mt-1 text-sm text-muted">
          Students can be enrolled by Admins.
        </p>
      </div>
    );
  }

  return (
    <div className="
      overflow-hidden rounded-2xl border border-border bg-white shadow-sm
    ">
      <div className="border-b border-border bg-surface px-6 py-4">
        <h3 className="font-semibold text-foreground">
          Enrolled Students ({students.length})
        </h3>
      </div>
      <div className="divide-y divide-border">
        {students.map((student) => (
          <div key={student.id} className="flex items-center gap-3 px-6 py-4">
            <div className="
              flex size-10 shrink-0 items-center justify-center rounded-full
              bg-primary/10 text-sm font-bold text-primary
            ">
              {student.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-medium text-foreground">{student.name}</p>
              <p className="text-xs text-muted">{student.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Tab = "overview" | "notes" | "assignments" | "forum" | "students";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const user = useAuthStore((s) => s.user);

  const { data: course, isLoading } = api.useQuery("get", "/courses/{id}", {
    params: { path: { id: courseId } },
  });

  const canManage =
    user?.role === "ADMIN" ||
    (user?.role === "TEACHER" && course?.teacherName === user?.name);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="
          size-8 animate-spin rounded-full border-2 border-border
          border-t-primary
        " />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-20 text-center text-muted">Course not found.</div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BookOpen size={15} /> },
    { id: "notes", label: "Notes", icon: <BookOpen size={15} /> },
    {
      id: "assignments",
      label: "Assignments",
      icon: <ClipboardList size={15} />,
    },
    { id: "forum", label: "Forum", icon: <MessageSquare size={15} /> },
    ...(canManage
      ? [
          {
            id: "students" as Tab,
            label: "Students",
            icon: <Users size={15} />,
          },
        ]
      : []),
  ];

  return (
    <div>
      {/* Back */}
      <Link
        href="/courses"
        className="
          mb-4 inline-flex items-center gap-1.5 text-sm text-muted
          transition-colors
          hover:text-foreground
        "
      >
        <ArrowLeft size={14} />
        Back to Courses
      </Link>

      {/* Course header */}
      <div className="
        mb-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm
      ">
        <div
          className="h-3 w-full"
          style={{
            background: `linear-gradient(90deg, hsl(${(courseId * 37) % 360}, 70%, 55%), hsl(${((courseId * 37) % 360) + 40}, 70%, 65%))`,
          }}
        />
        <div className="p-6">
          <div className="flex flex-wrap items-start gap-3">
            <span className="
              rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold
              text-primary
            ">
              {course.courseCode}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-foreground">
            {course.name}
          </h1>
          {course.description && (
            <p className="mt-1.5 text-sm text-muted">{course.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            <span>
              <strong className="text-foreground">Teacher:</strong>{" "}
              {course.teacherName}
            </span>
            <span>
              <strong className="text-foreground">Capacity:</strong>{" "}
              {course.maxStudents} students
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="
        mb-4 flex gap-1 overflow-x-auto rounded-xl border border-border bg-white
        p-1 shadow-sm
      ">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              `
                flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
                whitespace-nowrap transition-all
              `,
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : `
                  text-muted
                  hover:bg-surface hover:text-foreground
                `,
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && (
          <div className="
            grid grid-cols-1 gap-4
            sm:grid-cols-3
          ">
            <Link
              href={`/courses/${courseId}/notes`}
              className="
                flex items-center gap-4 rounded-2xl border border-border
                bg-white p-5 shadow-sm transition-all
                hover:-translate-y-0.5 hover:shadow-md
              "
            >
              <div className="
                flex size-12 items-center justify-center rounded-xl
                bg-primary/10 text-primary
              ">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Notes</p>
                <p className="text-sm text-muted">Course materials</p>
              </div>
            </Link>
            <Link
              href={`/courses/${courseId}/assignments`}
              className="
                flex items-center gap-4 rounded-2xl border border-border
                bg-white p-5 shadow-sm transition-all
                hover:-translate-y-0.5 hover:shadow-md
              "
            >
              <div className="
                flex size-12 items-center justify-center rounded-xl bg-accent/10
                text-accent
              ">
                <ClipboardList size={22} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Assignments</p>
                <p className="text-sm text-muted">Tasks & submissions</p>
              </div>
            </Link>
            <Link
              href={`/courses/${courseId}/forum`}
              className="
                flex items-center gap-4 rounded-2xl border border-border
                bg-white p-5 shadow-sm transition-all
                hover:-translate-y-0.5 hover:shadow-md
              "
            >
              <div className="
                flex size-12 items-center justify-center rounded-xl
                bg-success/10 text-success
              ">
                <MessageSquare size={22} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Forum</p>
                <p className="text-sm text-muted">AI-powered discussion</p>
              </div>
            </Link>
          </div>
        )}

        {activeTab === "notes" && <CourseNotesPage isEmbedded />}

        {activeTab === "assignments" && <AssignmentsPage isEmbedded />}

        {activeTab === "forum" && <CourseForum isEmbedded />}

        {activeTab === "students" && <CourseStudents courseId={courseId} />}

        {/* Redirect to sub-pages for full content */}
        {activeTab !== "overview" && activeTab !== "students" && (
          <div className="
            mt-4 rounded-2xl border border-border bg-white p-4 text-center
            text-sm text-muted shadow-sm
          ">
            <Link
              href={`/courses/${courseId}/${activeTab}`}
              className="
                font-semibold text-primary transition-colors
                hover:text-primary-dark hover:underline
              "
            >
              Open {tabs.find((t) => t.id === activeTab)?.label} in Full Page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
