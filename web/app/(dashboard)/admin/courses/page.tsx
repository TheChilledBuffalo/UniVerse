"use client";

import Button from "@/components/Button";
import DataTable, { Column } from "@/components/dashboard/DataTable";
import EmptyState from "@/components/dashboard/EmptyState";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import SearchableSelect from "@/components/dashboard/SearchableSelect";
import InputField from "@/components/InputField";
import api from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import useAuthStore from "@/store/authStore";
import { components } from "@universe/api-types";
import { BookOpen, Edit2, Plus, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type Course = components["schemas"]["CourseResponse"];

export default function AdminCoursesPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (currentUser && currentUser.role !== "ADMIN") router.replace("/");
  }, [currentUser, router]);

  const {
    data: courses,
    isLoading,
    refetch,
  } = api.useQuery("get", "/admin/courses");
  const { data: users } = api.useQuery("get", "/admin/users");

  const teachers =
    users?.filter((u) => u.role === "TEACHER" || u.role === "ADMIN") ?? [];

  const [showCreate, setShowCreate] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState<number | "">("");
  const [maxStudents, setMaxStudents] = useState(30);

  const csvRef = useRef<HTMLInputElement>(null);

  const createCourse = api.useMutation("post", "/admin/course", {
    onSuccess: () => {
      toast.success("Course created!");
      setShowCreate(false);
      resetForm();
      refetch();
    },
    onError: (e) =>
      toast.error(parseErrorMessage(e, "Failed to create course")),
  });

  const updateCourse = api.useMutation("put", "/admin/course/{id}", {
    onSuccess: () => {
      toast.success("Course updated!");
      setEditCourse(null);
      resetForm();
      refetch();
    },
    onError: (e) =>
      toast.error(parseErrorMessage(e, "Failed to update course")),
  });

  const deleteCourse = api.useMutation("delete", "/admin/course/{id}", {
    onSuccess: () => {
      toast.success("Course deleted");
      refetch();
    },
    onError: (e) =>
      toast.error(parseErrorMessage(e, "Failed to delete course")),
  });

  const resetForm = () => {
    setName("");
    setCourseCode("");
    setDescription("");
    setTeacherId("");
    setMaxStudents(30);
  };

  const openEdit = (c: Course) => {
    setEditCourse(c);
    setName(c.name);
    setCourseCode(c.courseCode);
    setDescription(c.description ?? "");
    setMaxStudents(c.maxStudents);
    // Teacher id not available in CourseResponse, set blank
    setTeacherId("");
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = useAuthStore.getState().token;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/admin/courses/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Courses uploaded from CSV!");
      refetch();
    } catch (e) {
      toast.error(parseErrorMessage(e, "CSV upload failed"));
    } finally {
      if (csvRef.current) csvRef.current.value = "";
    }
  };

  const columns: Column<Course>[] = [
    { key: "id", label: "ID" },
    { key: "courseCode", label: "Code" },
    { key: "name", label: "Name" },
    {
      key: "teacherName",
      label: "Teacher",
      render: (c) => <span className="text-muted">{c.teacherName}</span>,
    },
    {
      key: "maxStudents",
      label: "Max Students",
      render: (c) => <span className="font-semibold">{c.maxStudents}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (c) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(c)}
            className="
              flex size-7 items-center justify-center rounded-lg text-muted
              hover:bg-primary/10 hover:text-primary
            "
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() =>
              deleteCourse.mutate({ params: { path: { id: c.id } } })
            }
            className="
              flex size-7 items-center justify-center rounded-lg text-muted
              hover:bg-error/10 hover:text-error
            "
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (currentUser?.role !== "ADMIN") return null;

  return (
    <div>
      <PageHeader
        title="Course Management"
        description="Create and manage all courses"
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
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-1.5 inline" />
              Add Course
            </Button>
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
          description="Create courses or import from a CSV file."
        />
      ) : (
        <DataTable columns={columns} data={courses as Course[]} keyField="id" />
      )}

      {/* Create Course Modal */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          resetForm();
        }}
        title="Add Course"
        maxWidth="lg"
      >
        <CourseForm
          name={name}
          courseCode={courseCode}
          description={description}
          teacherId={teacherId}
          maxStudents={maxStudents}
          teachers={teachers}
          onName={setName}
          onCourseCode={setCourseCode}
          onDescription={setDescription}
          onTeacherId={setTeacherId}
          onMaxStudents={setMaxStudents}
          onSubmit={(e) => {
            e.preventDefault();
            if (!teacherId) return toast.error("Select a teacher");
            createCourse.mutate({
              body: {
                name,
                courseCode,
                description,
                teacherId: Number(teacherId),
                maxStudents,
              },
            });
          }}
          submitLabel="Create Course"
        />
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        open={!!editCourse}
        onClose={() => {
          setEditCourse(null);
          resetForm();
        }}
        title={`Edit — ${editCourse?.name}`}
        maxWidth="lg"
      >
        <CourseForm
          name={name}
          courseCode={courseCode}
          description={description}
          teacherId={teacherId}
          maxStudents={maxStudents}
          teachers={teachers}
          onName={setName}
          onCourseCode={setCourseCode}
          onDescription={setDescription}
          onTeacherId={setTeacherId}
          onMaxStudents={setMaxStudents}
          onSubmit={(e) => {
            e.preventDefault();
            if (!editCourse) return;
            updateCourse.mutate({
              params: { path: { id: editCourse.id } },
              body: {
                name,
                courseCode,
                description,
                teacherId: teacherId ? Number(teacherId) : undefined,
                maxStudents,
              },
            });
          }}
          submitLabel="Save Changes"
        />
      </Modal>
    </div>
  );
}

function CourseForm({
  name,
  courseCode,
  description,
  teacherId,
  maxStudents,
  teachers,
  onName,
  onCourseCode,
  onDescription,
  onTeacherId,
  onMaxStudents,
  onSubmit,
  submitLabel,
}: {
  name: string;
  courseCode: string;
  description: string;
  teacherId: number | "";
  maxStudents: number;
  teachers: { id: number; name: string }[];
  onName: (v: string) => void;
  onCourseCode: (v: string) => void;
  onDescription: (v: string) => void;
  onTeacherId: (v: number | "") => void;
  onMaxStudents: (v: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Course Name *"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Introduction to CS"
          required
        />
        <InputField
          label="Course Code *"
          value={courseCode}
          onChange={(e) => onCourseCode(e.target.value)}
          placeholder="CS101"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-foreground">
          Description
        </label>
        <textarea
          className="
            rounded-xl border border-border px-4 py-2.5 text-sm
            focus:border-primary focus:ring-2 focus:ring-primary/20
            focus:outline-none
          "
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          rows={2}
          placeholder="Course description..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-foreground">
            Teacher *
          </label>
          <SearchableSelect
            options={teachers.map((t) => ({ label: t.name, value: t.id! }))}
            value={teacherId}
            onChange={(val) => onTeacherId(val ? Number(val) : "")}
            placeholder="Select teacher"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-foreground">
            Max Students
          </label>
          <input
            type="number"
            min={1}
            className="
              rounded-xl border border-border px-4 py-3 text-sm
              focus:border-primary focus:ring-2 focus:ring-primary/20
              focus:outline-none
            "
            value={maxStudents}
            onChange={(e) => onMaxStudents(Number(e.target.value))}
          />
        </div>
      </div>
      <Button type="submit" fullWidth>
        {submitLabel}
      </Button>
    </form>
  );
}
