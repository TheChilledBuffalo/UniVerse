"use client";

import Button from "@/components/Button";
import EmptyState from "@/components/dashboard/EmptyState";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import InputField from "@/components/InputField";
import api, { downloadAuthenticatedFile } from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import useAuthStore from "@/store/authStore";
import { components } from "@universe/api-types";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ClipboardList,
  Clock,
  Download,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type Assignment = components["schemas"]["CourseAssignmentResponse"];

function formatDate(dateStr?: string) {
  if (!dateStr) return "No due date";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPast(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function AssignmentCard({
  assignment,
  courseId,
  canManage,
  onEdit,
  onDelete,
}: {
  assignment: Assignment;
  courseId: number;
  canManage: boolean;
  onEdit: (a: Assignment) => void;
  onDelete: (id: number) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const overdue = isPast(assignment.dueAt);

  return (
    <div className="
      flex items-start gap-4 rounded-2xl border border-border bg-white p-5
      shadow-sm transition-shadow
      hover:shadow-md
    ">
      <div className="
        flex size-11 shrink-0 items-center justify-center rounded-xl
        bg-accent/10 text-accent
      ">
        <ClipboardList size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">{assignment.title}</p>
            {assignment.description && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                {assignment.description}
              </p>
            )}
          </div>
          {assignment.dueAt && (
            <span
              className={`
                flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs
                font-semibold
                ${
                overdue
                  ? "bg-error/10 text-error"
                  : "bg-success/10 text-success"
              }
              `}
            >
              <Clock size={11} />
              {overdue ? "Overdue" : "Open"}
            </span>
          )}
        </div>
        <div className="
          mt-2 flex flex-wrap items-center gap-3 text-xs text-muted
        ">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            Due: {formatDate(assignment.dueAt)}
          </span>
          {assignment.originalFileName && (
            <span>{assignment.originalFileName}</span>
          )}
          <span>by {assignment.createdByName}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            href={`/courses/${courseId}/assignments/${assignment.id}`}
            className="
              flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5
              text-xs font-semibold text-white transition-colors
              hover:bg-primary-dark
            "
          >
            View <ArrowRight size={13} />
          </Link>
          {assignment.fileUrl && (
            <button
              onClick={async () => {
                setDownloading(true);
                try {
                  await downloadAuthenticatedFile(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/courses/${courseId}/assignments/${assignment.id}/download`,
                    assignment.originalFileName || "assignment.pdf",
                  );
                } catch {
                  toast.error("Download failed");
                } finally {
                  setDownloading(false);
                }
              }}
              disabled={downloading}
              className="
                flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5
                text-xs font-semibold text-muted transition-colors
                hover:bg-border hover:text-foreground
                disabled:opacity-50
              "
            >
              <Download size={13} /> Download
            </button>
          )}
          {canManage && (
            <>
              <button
                onClick={() => onEdit(assignment)}
                className="
                  flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5
                  text-xs font-semibold text-muted transition-colors
                  hover:bg-primary/10 hover:text-primary
                "
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => onDelete(assignment.id!)}
                className="
                  flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5
                  text-xs font-semibold text-muted transition-colors
                  hover:bg-error hover:text-white
                "
              >
                <Trash2 size={13} /> Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssignmentsPage({
  isEmbedded = false,
}: {
  isEmbedded?: boolean;
}) {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState<Assignment | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setTitle("");
    setDescription("");
    setDueAt("");
    setFile(null);
    setShowModal(true);
  };

  const openEdit = (a: Assignment) => {
    setTitle(a.title ?? "");
    setDescription(a.description ?? "");
    setDueAt(a.dueAt ? a.dueAt.slice(0, 16) : "");
    setEditModal(a);
  };

  const {
    data: assignments,
    isLoading,
    refetch,
  } = api.useQuery("get", "/courses/{id}/assignments", {
    params: { path: { id: courseId } },
  });

  const updateAssignment = api.useMutation(
    "put",
    "/courses/{id}/assignments/{assignmentId}",
    {
      onSuccess: () => {
        toast.success("Assignment updated");
        setEditModal(null);
        refetch();
      },
      onError: (e) =>
        toast.error(parseErrorMessage(e, "Failed to update assignment")),
    },
  );

  const deleteAssignment = api.useMutation(
    "delete",
    "/courses/{id}/assignments/{assignmentId}",
    {
      onSuccess: () => {
        toast.success("Assignment deleted");
        refetch();
      },
      onError: (e) =>
        toast.error(parseErrorMessage(e, "Failed to delete assignment")),
    },
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = useAuthStore.getState().token;
      const params = new URLSearchParams({ title });
      if (description) params.set("description", description);
      if (dueAt)
        params.set("dueAt", dueAt.length === 16 ? dueAt + ":00" : dueAt);

      const formData = new FormData();
      if (file) formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/courses/${courseId}/assignments?${params}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: file ? formData : undefined,
        },
      );
      if (!res.ok) throw new Error("Failed to create assignment");
      toast.success("Assignment created!");
      setShowModal(false);
      setTitle("");
      setDescription("");
      setDueAt("");
      setFile(null);
      refetch();
    } catch (e) {
      toast.error(parseErrorMessage(e, "Failed to create assignment"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {!isEmbedded && (
        <>
          <Link
            href={`/courses/${courseId}`}
            className="
              mb-4 inline-flex items-center gap-1.5 text-sm text-muted
              hover:text-foreground
            "
          >
            <ArrowLeft size={14} /> Back to Course
          </Link>

          <PageHeader
            title="Assignments"
            description="Course tasks and submissions"
            action={
              canManage ? (
                <Button onClick={openCreate}>
                  <Plus size={16} className="mr-1.5 inline" />
                  Create Assignment
                </Button>
              ) : undefined
            }
          />
        </>
      )}

      {isEmbedded && canManage && (
        <div className="mb-4 flex justify-end">
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-1.5 inline" />
            Create Assignment
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="
            size-8 animate-spin rounded-full border-2 border-border
            border-t-primary
          " />
        </div>
      ) : !assignments || assignments.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={32} />}
          title="No assignments yet"
          description={
            canManage
              ? "Create the first assignment for this course."
              : "No assignments have been posted yet."
          }
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              courseId={courseId}
              canManage={canManage}
              onEdit={openEdit}
              onDelete={(aId) =>
                deleteAssignment.mutate({
                  params: {
                    path: { id: courseId, assignmentId: aId },
                  },
                })
              }
            />
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create Assignment"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <InputField
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assignment title"
            required
          />
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
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Assignment instructions..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Due Date
            </label>
            <input
              type="datetime-local"
              className="
                rounded-xl border border-border px-4 py-2.5 text-sm
                focus:border-primary focus:ring-2 focus:ring-primary/20
                focus:outline-none
              "
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Attachment (optional)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="
                rounded-xl border border-border px-4 py-2.5 text-sm
                file:mr-3 file:rounded-lg file:border-0 file:bg-primary
                file:px-3 file:py-1 file:text-xs file:font-semibold
                file:text-white
              "
            />
          </div>
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Creating..." : "Create Assignment"}
          </Button>
        </form>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Assignment"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editModal) return;
            updateAssignment.mutate({
              params: {
                path: { id: courseId, assignmentId: editModal.id! },
                query: {
                  title,
                  description,
                  dueAt: dueAt
                    ? dueAt.length === 16
                      ? dueAt + ":00"
                      : dueAt
                    : undefined,
                },
              },
            });
          }}
          className="flex flex-col gap-4"
        >
          <InputField
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assignment title"
            required
          />
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
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Due Date
            </label>
            <input
              type="datetime-local"
              className="
                rounded-xl border border-border px-4 py-2.5 text-sm
                focus:border-primary focus:ring-2 focus:ring-primary/20
                focus:outline-none
              "
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </div>
          <Button type="submit" fullWidth disabled={updateAssignment.isPending}>
            {updateAssignment.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
