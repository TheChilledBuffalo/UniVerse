"use client";

import Button from "@/components/Button";
import DataTable, { Column } from "@/components/dashboard/DataTable";
import EmptyState from "@/components/dashboard/EmptyState";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import SearchableSelect from "@/components/dashboard/SearchableSelect";
import api from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import useAuthStore from "@/store/authStore";
import { components } from "@universe/api-types";
import { Plus, Trash2, Upload, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type Enrollment = components["schemas"]["EnrollmentResponse"];

export default function AdminEnrollmentsPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (currentUser && currentUser.role !== "ADMIN") router.replace("/");
  }, [currentUser, router]);

  const { data: users } = api.useQuery("get", "/admin/users");
  const { data: courses } = api.useQuery("get", "/admin/courses");

  const students = users?.filter((u) => u.role === "STUDENT") ?? [];

  // We'll track enrollments by fetching for a selected student or course
  const [filterMode, setFilterMode] = useState<"STUDENT" | "COURSE">("STUDENT");
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollStudentId, setEnrollStudentId] = useState<number | "">("");
  const [enrollCourseId, setEnrollCourseId] = useState<number | "">("");

  const csvRef = useRef<HTMLInputElement>(null);

  const { data: studentEnrollments, refetch: refetchEnrollments } =
    api.useQuery("get", "/admin/enrollments/student/{studentId}", {
      params: { path: { studentId: Number(selectedStudentId) } },
      enabled: filterMode === "STUDENT" && !!selectedStudentId,
    });

  const { data: courseEnrollments, refetch: refetchCourseEnrollments } =
    api.useQuery("get", "/admin/enrollments/course/{courseId}", {
      params: { path: { courseId: Number(selectedCourseId) } },
      enabled: filterMode === "COURSE" && !!selectedCourseId,
    });

  const refreshData = () => {
    refetchEnrollments();
    refetchCourseEnrollments();
  };

  const enrollStudent = api.useMutation("post", "/admin/enrollment", {
    onSuccess: () => {
      toast.success("Student enrolled!");
      setShowEnrollModal(false);
      setEnrollStudentId("");
      setEnrollCourseId("");
      refreshData();
    },
    onError: (e) => toast.error(parseErrorMessage(e, "Failed to enroll")),
  });

  const removeEnrollment = api.useMutation("delete", "/admin/enrollment", {
    onSuccess: () => {
      toast.success("Enrollment removed");
      refreshData();
    },
    onError: (e) =>
      toast.error(parseErrorMessage(e, "Failed to remove enrollment")),
  });

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = useAuthStore.getState().token;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/admin/enrollments/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Enrollments uploaded from CSV!");
      refreshData();
    } catch (e) {
      toast.error(parseErrorMessage(e, "CSV upload failed"));
    } finally {
      if (csvRef.current) csvRef.current.value = "";
    }
  };

  const columns: Column<Enrollment>[] = [
    { key: "enrollmentId", label: "ID" },
    { key: "studentName", label: "Student" },
    { key: "courseName", label: "Course" },
    {
      key: "actions",
      label: "Actions",
      render: (e) => (
        <button
          onClick={() =>
            removeEnrollment.mutate({
              params: {
                query: {
                  student_id: e.studentId,
                  course_id: e.courseId,
                },
              },
            })
          }
          className="
            flex size-7 items-center justify-center rounded-lg text-muted
            hover:bg-error/10 hover:text-error
          "
          title="Remove enrollment"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  if (currentUser?.role !== "ADMIN") return null;

  return (
    <div>
      <PageHeader
        title="Enrollment Management"
        description="Manage student-course enrollments"
        action={
          <div className="
            flex flex-wrap justify-start gap-3
            sm:justify-end
          ">
            <input
              ref={csvRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvUpload}
            />
            <button
              onClick={() => csvRef.current?.click()}
              className="
                flex shrink-0 items-center gap-1.5 rounded-xl border
                border-border bg-white px-4 py-2 text-sm font-semibold
                whitespace-nowrap text-muted shadow-sm
                hover:border-primary hover:text-primary
              "
            >
              <Upload size={15} /> Import CSV
            </button>
            <Button onClick={() => setShowEnrollModal(true)}>
              <Plus size={16} className="mr-1.5 inline" />
              Enroll Student
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="
          flex rounded-lg border border-border bg-surface p-1 shadow-sm
        ">
          <button
            onClick={() => setFilterMode("STUDENT")}
            className={`
              rounded-md px-3 py-1.5 text-sm font-semibold transition-colors
              ${
              filterMode === "STUDENT"
                ? "bg-white text-foreground shadow-sm"
                : `
                  text-muted
                  hover:text-foreground
                `
            }
            `}
          >
            By Student
          </button>
          <button
            onClick={() => setFilterMode("COURSE")}
            className={`
              rounded-md px-3 py-1.5 text-sm font-semibold transition-colors
              ${
              filterMode === "COURSE"
                ? "bg-white text-foreground shadow-sm"
                : `
                  text-muted
                  hover:text-foreground
                `
            }
            `}
          >
            By Course
          </button>
        </div>

        {filterMode === "STUDENT" ? (
          <div className="
            w-64
            sm:w-80
          ">
            <SearchableSelect
              options={students.map((s) => ({
                label: `${s.name} (${s.email})`,
                value: s.id!,
              }))}
              value={selectedStudentId}
              onChange={(val) => setSelectedStudentId(val ? Number(val) : "")}
              placeholder="Select a student..."
            />
          </div>
        ) : (
          <div className="
            w-64
            sm:w-80
          ">
            <SearchableSelect
              options={(courses ?? []).map((c) => ({
                label: `${c.courseCode} — ${c.name}`,
                value: c.id!,
              }))}
              value={selectedCourseId}
              onChange={(val) => setSelectedCourseId(val ? Number(val) : "")}
              placeholder="Select a course..."
            />
          </div>
        )}
      </div>

      {filterMode === "STUDENT" && !selectedStudentId ? (
        <EmptyState
          icon={<Users size={32} />}
          title="Select a student"
          description="Choose a student above to view their enrollments."
        />
      ) : filterMode === "COURSE" && !selectedCourseId ? (
        <EmptyState
          icon={<Users size={32} />}
          title="Select a course"
          description="Choose a course above to view its enrollments."
        />
      ) : (filterMode === "STUDENT" &&
          (!studentEnrollments || studentEnrollments.length === 0)) ||
        (filterMode === "COURSE" &&
          (!courseEnrollments || courseEnrollments.length === 0)) ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No enrollments"
          description={
            filterMode === "STUDENT"
              ? "This student is not enrolled in any courses."
              : "No students are enrolled in this course."
          }
          action={
            <Button onClick={() => setShowEnrollModal(true)}>
              <Plus size={16} className="mr-1.5 inline" />
              Enroll Student
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={
            (filterMode === "STUDENT"
              ? studentEnrollments
              : courseEnrollments) as Enrollment[]
          }
          keyField="enrollmentId"
        />
      )}

      {/* Enroll Modal */}
      <Modal
        open={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Enroll Student"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!enrollStudentId || !enrollCourseId)
              return toast.error("Select both student and course");
            enrollStudent.mutate({
              body: {
                studentId: Number(enrollStudentId),
                courseId: Number(enrollCourseId),
              },
            });
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Student *
            </label>
            <SearchableSelect
              options={students.map((s) => ({
                label: `${s.name} (${s.email})`,
                value: s.id!,
              }))}
              value={enrollStudentId}
              onChange={(val) => setEnrollStudentId(val ? Number(val) : "")}
              placeholder="Select student"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Course *
            </label>
            <SearchableSelect
              options={(courses ?? []).map((c) => ({
                label: `${c.courseCode} — ${c.name}`,
                value: c.id!,
              }))}
              value={enrollCourseId}
              onChange={(val) => setEnrollCourseId(val ? Number(val) : "")}
              placeholder="Select course"
              required
            />
          </div>
          <Button type="submit" fullWidth>
            Enroll
          </Button>
        </form>
      </Modal>
    </div>
  );
}
