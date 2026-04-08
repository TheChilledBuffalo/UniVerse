"use client";

import Button from "@/components/Button";
import EmptyState from "@/components/dashboard/EmptyState";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import api, { downloadAuthenticatedFile } from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import useAuthStore from "@/store/authStore";
import { components } from "@universe/api-types";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Edit2,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type Note = components["schemas"]["CourseNoteResponse"];

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function NoteCard({
  note,
  courseId,
  canManage,
  onEdit,
  onDelete,
}: {
  note: Note;
  courseId: number;
  canManage: boolean;
  onEdit: (n: Note) => void;
  onDelete: (id: number) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  return (
    <div className="
      flex items-center gap-4 rounded-2xl border border-border bg-white p-4
      shadow-sm transition-shadow
      hover:shadow-md
    ">
      <div className="
        flex size-11 shrink-0 items-center justify-center rounded-xl
        bg-primary/10 text-primary
      ">
        <FileText size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{note.title}</p>
        {note.description && (
          <p className="line-clamp-1 text-sm text-muted">{note.description}</p>
        )}
        <p className="mt-0.5 text-xs text-muted">
          {note.originalFileName} · {formatBytes(note.fileSize)} ·{" "}
          {note.createdByName}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            setDownloading(true);
            try {
              await downloadAuthenticatedFile(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/courses/${courseId}/notes/${note.id}/download`,
                note.originalFileName || "note.pdf",
              );
            } catch {
              toast.error("Failed to download note");
            } finally {
              setDownloading(false);
            }
          }}
          disabled={downloading}
          className="
            flex size-8 items-center justify-center rounded-lg bg-surface
            text-muted transition-colors
            hover:bg-primary hover:text-white
          "
          title="Download"
        >
          <Download size={15} />
        </button>
        {canManage && (
          <>
            <button
              onClick={() => onEdit(note)}
              className="
                flex size-8 items-center justify-center rounded-lg bg-surface
                text-muted transition-colors
                hover:bg-primary hover:text-white
              "
              title="Edit Note"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => onDelete(note.id!)}
              className="
                flex size-8 items-center justify-center rounded-lg bg-surface
                text-muted transition-colors
                hover:bg-error hover:text-white
              "
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CourseNotesPage({
  isEmbedded = false,
}: {
  isEmbedded?: boolean;
}) {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const user = useAuthStore((s) => s.user);
  const canCreate = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const openCreate = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setShowModal(true);
  };

  const openEdit = (n: Note) => {
    setTitle(n.title ?? "");
    setDescription(n.description ?? "");
    setEditModal(n);
  };

  const {
    data: notes,
    isLoading,
    refetch,
  } = api.useQuery("get", "/courses/{id}/notes", {
    params: { path: { id: courseId } },
  });

  const updateNote = api.useMutation("put", "/courses/{id}/notes/{noteId}", {
    onSuccess: () => {
      toast.success("Note updated");
      setEditModal(null);
      refetch();
    },
    onError: (e) => toast.error(parseErrorMessage(e, "Failed to update note")),
  });

  const deleteNote = api.useMutation("delete", "/courses/{id}/notes/{noteId}", {
    onSuccess: () => {
      toast.success("Note deleted");
      refetch();
    },
    onError: (e) => toast.error(parseErrorMessage(e, "Failed to delete note")),
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = useAuthStore.getState().token;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/courses/${courseId}/notes?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Note uploaded!");
      setShowModal(false);
      setTitle("");
      setDescription("");
      setFile(null);
      refetch();
    } catch (e) {
      toast.error(parseErrorMessage(e, "Failed to upload note"));
    } finally {
      setUploading(false);
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
            title="Course Notes"
            description="Study materials and resources"
            action={
              canCreate ? (
                <Button onClick={openCreate}>
                  <Plus size={16} className="mr-1.5 inline" />
                  Upload Note
                </Button>
              ) : undefined
            }
          />
        </>
      )}

      {isEmbedded && canCreate && (
        <div className="mb-4 flex justify-end">
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-1.5 inline" />
            Upload Note
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
      ) : !notes || notes.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="No notes yet"
          description={
            canCreate
              ? "Upload the first note for this course."
              : "No notes have been uploaded yet."
          }
          action={
            canCreate ? (
              <Button onClick={openCreate}>
                <Plus size={16} className="mr-1.5 inline" />
                Upload Note
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              courseId={courseId}
              canManage={canCreate}
              onEdit={openEdit}
              onDelete={(nId) =>
                deleteNote.mutate({
                  params: { path: { id: courseId, noteId: nId } },
                })
              }
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Upload Note"
      >
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Title *
            </label>
            <input
              className="
                rounded-xl border border-border px-4 py-2.5 text-sm
                focus:border-primary focus:ring-2 focus:ring-primary/20
                focus:outline-none
              "
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Lecture 1 - Introduction"
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
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional description"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              File *
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
              required
            />
          </div>
          <Button type="submit" fullWidth disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Note"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editModal) return;
            updateNote.mutate({
              params: {
                path: { id: courseId, noteId: editModal.id! },
                query: { title, description },
              },
            });
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Title *
            </label>
            <input
              className="
                rounded-xl border border-border px-4 py-2.5 text-sm
                focus:border-primary focus:ring-2 focus:ring-primary/20
                focus:outline-none
              "
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <Button type="submit" fullWidth disabled={updateNote.isPending}>
            {updateNote.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
