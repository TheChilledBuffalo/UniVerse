"use client";

import Button from "@/components/Button";
import DataTable from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import api, { downloadAuthenticatedFile } from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import useAuthStore from "@/store/authStore";
import { components } from "@universe/api-types";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  Edit2,
  Star,
  Upload,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type Submission = components["schemas"]["AssignmentSubmissionResponse"];

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Student view — submit/view own submission
function StudentAssignmentView({
  courseId,
  assignmentId,
}: {
  courseId: number;
  assignmentId: number;
}) {
  const {
    data: submission,
    isLoading,
    refetch,
  } = api.useQuery(
    "get",
    "/courses/{id}/assignments/{assignmentId}/submission",
    { params: { path: { id: courseId, assignmentId } } },
  );

  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateNote, setUpdateNote] = useState("");
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  const deleteSubmission = api.useMutation(
    "delete",
    "/courses/{id}/assignments/{assignmentId}/submission",
    {
      onSuccess: () => {
        toast.success("Submission retracted");
        refetch();
      },
      onError: (e) =>
        toast.error(parseErrorMessage(e, "Failed to retract submission")),
    },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    setSubmitting(true);
    try {
      const token = useAuthStore.getState().token;
      const params = new URLSearchParams();
      if (note) params.set("submissionNote", note);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/courses/${courseId}/assignments/${assignmentId}/submission?${params}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Submission failed");
      toast.success("Submitted successfully!");
      setNote("");
      setFile(null);
      refetch();
    } catch (e) {
      toast.error(parseErrorMessage(e, "Failed to submit"));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="
          size-7 animate-spin rounded-full border-2 border-border
          border-t-primary
        " />
      </div>
    );
  }

  if (submission?.id) {
    // Already submitted
    const graded = submission.gradeScore != null;
    return (
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`
              flex size-10 items-center justify-center rounded-xl
              ${
              graded ? `bg-success/10 text-success` : `bg-accent/10 text-accent`
            }
            `}
          >
            {graded ? <CheckCircle size={20} /> : <Clock size={20} />}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {graded ? "Graded" : "Submitted — Awaiting Grade"}
            </p>
            <p className="text-xs text-muted">
              Submitted {formatDate(submission.submittedAt)}
            </p>
          </div>
        </div>

        {submission.submissionNote && (
          <div className="
            mb-3 rounded-xl bg-surface p-3 text-sm text-foreground
          ">
            <p className="mb-1 text-xs font-semibold text-muted">Your Note</p>
            {submission.submissionNote}
          </div>
        )}

        {graded && (
          <div className="
            mb-3 rounded-xl border border-success/20 bg-success/5 p-4
          ">
            <div className="mb-1 flex items-center gap-2">
              <Star size={16} className="text-success" />
              <p className="text-lg font-bold text-success">
                {submission.gradeScore}/100
              </p>
            </div>
            {submission.gradeFeedback && (
              <p className="text-sm text-muted">{submission.gradeFeedback}</p>
            )}
            <p className="mt-1 text-xs text-muted">
              Graded by {submission.gradedByName} ·{" "}
              {formatDate(submission.gradedAt)}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={async () => {
              setDownloading(true);
              try {
                await downloadAuthenticatedFile(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/courses/${courseId}/assignments/${assignmentId}/submission/download`,
                  submission.originalFileName || "submission",
                );
              } catch {
                toast.error("Download failed");
              } finally {
                setDownloading(false);
              }
            }}
            disabled={downloading}
            className="
              flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-sm
              font-semibold text-muted
              hover:bg-border hover:text-foreground
              disabled:opacity-50
            "
          >
            <Download size={15} /> Download
          </button>
          {!graded && (
            <>
              <button
                onClick={() => {
                  setUpdateNote(submission.submissionNote || "");
                  setUpdateFile(null);
                  setShowUpdateModal(true);
                }}
                className="
                  flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2
                  text-sm font-semibold text-muted
                  hover:bg-primary/10 hover:text-primary
                "
              >
                <Edit2 size={15} /> Update
              </button>
              <button
                onClick={() =>
                  deleteSubmission.mutate({
                    params: { path: { id: courseId, assignmentId } },
                  })
                }
                className="
                  flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2
                  text-sm font-semibold text-muted
                  hover:bg-error hover:text-white
                "
              >
                <XCircle size={15} /> Retract
              </button>
            </>
          )}
        </div>

        {/* Update Submission Modal */}
        <Modal
          open={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          title="Update Submission"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setUpdating(true);
              try {
                const token = useAuthStore.getState().token;
                const params = new URLSearchParams();
                if (updateNote) params.set("submissionNote", updateNote);
                else params.set("submissionNote", "");
                const formData = new FormData();
                if (updateFile) formData.append("file", updateFile);
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/courses/${courseId}/assignments/${assignmentId}/submission?${params}`,
                  {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                    body: updateFile ? formData : undefined,
                  },
                );
                if (!res.ok) throw new Error("Update failed");
                toast.success("Submission updated!");
                setShowUpdateModal(false);
                refetch();
              } catch (e) {
                toast.error(parseErrorMessage(e, "Failed to update"));
              } finally {
                setUpdating(false);
              }
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-foreground">
                Note (optional)
              </label>
              <textarea
                className="
                  rounded-xl border border-border px-4 py-2.5 text-sm
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  focus:outline-none
                "
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-foreground">
                New File (optional)
              </label>
              <input
                type="file"
                onChange={(e) => setUpdateFile(e.target.files?.[0] ?? null)}
                className="
                  rounded-xl border border-border px-4 py-2.5 text-sm
                  file:mr-3 file:rounded-lg file:border-0 file:bg-primary
                  file:px-3 file:py-1 file:text-xs file:font-semibold
                  file:text-white
                "
              />
              <p className="mt-1 text-xs text-muted">
                Leave blank to keep your currently submitted file.
              </p>
            </div>
            <Button type="submit" disabled={updating} fullWidth>
              {updating ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-foreground">Submit Assignment</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-foreground">
            Note (optional)
          </label>
          <textarea
            className="
              rounded-xl border border-border px-4 py-2.5 text-sm
              focus:border-primary focus:ring-2 focus:ring-primary/20
              focus:outline-none
            "
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Any notes for your submission..."
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
              file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3
              file:py-1 file:text-xs file:font-semibold file:text-white
            "
            required
          />
        </div>
        <Button type="submit" disabled={submitting} fullWidth>
          <Upload size={15} className="mr-1.5 inline" />
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}

// Teacher view — see & grade all submissions
function TeacherSubmissionsView({
  courseId,
  assignmentId,
}: {
  courseId: number;
  assignmentId: number;
}) {
  const {
    data: submissions,
    isLoading,
    refetch,
  } = api.useQuery(
    "get",
    "/courses/{id}/assignments/{assignmentId}/submissions",
    { params: { path: { id: courseId, assignmentId } } },
  );

  const [gradeModal, setGradeModal] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const gradeSubmission = api.useMutation(
    "put",
    "/courses/{id}/assignments/{assignmentId}/submissions/{submissionId}/grade",
    {
      onSuccess: () => {
        toast.success("Graded!");
        setGradeModal(null);
        refetch();
      },
      onError: (e) => toast.error(parseErrorMessage(e, "Failed to grade")),
    },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="
          size-7 animate-spin rounded-full border-2 border-border
          border-t-primary
        " />
      </div>
    );
  }

  const cols = [
    { key: "studentName", label: "Student" },
    {
      key: "submittedAt",
      label: "Submitted",
      render: (row: Submission) => formatDate(row.submittedAt),
    },
    {
      key: "gradeScore",
      label: "Grade",
      render: (row: Submission) =>
        row.gradeScore != null ? (
          <span className="font-semibold text-success">
            {row.gradeScore}/100
          </span>
        ) : (
          <span className="text-muted">Ungraded</span>
        ),
    },
    {
      key: "gradeFeedback",
      label: "Feedback",
      render: (row: Submission) =>
        row.gradeFeedback ? (
          <span className="line-clamp-1 text-sm">{row.gradeFeedback}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: Submission) => (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (!row.id) return;
              setDownloadingId(row.id);
              try {
                await downloadAuthenticatedFile(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/courses/${courseId}/assignments/${assignmentId}/submissions/${row.id}/download`,
                  row.originalFileName || `submission-${row.id}`,
                );
              } catch {
                toast.error("Download failed");
              } finally {
                setDownloadingId(null);
              }
            }}
            disabled={downloadingId === row.id}
            className="
              rounded-lg bg-surface px-2 py-1 text-xs font-semibold text-muted
              hover:bg-border
              disabled:opacity-50
            "
          >
            <Download size={12} className="inline" /> Download
          </button>
          <button
            onClick={() => {
              setGradeModal(row);
              setGradeScore(String(row.gradeScore ?? ""));
              setGradeFeedback(row.gradeFeedback ?? "");
            }}
            className="
              rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold
              text-primary
              hover:bg-primary hover:text-white
            "
          >
            <Star size={12} className="inline" /> Grade
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        {submissions?.length ?? 0} submission(s)
      </p>
      <DataTable
        columns={cols as never}
        data={(submissions ?? []) as never}
        keyField="id"
        emptyMessage="No submissions yet."
      />

      {/* Grade Modal */}
      <Modal
        open={!!gradeModal}
        onClose={() => setGradeModal(null)}
        title={`Grade — ${gradeModal?.studentName}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!gradeModal?.id) return;
            gradeSubmission.mutate({
              params: {
                path: {
                  id: courseId,
                  assignmentId,
                  submissionId: gradeModal.id,
                },
              },
              body: {
                gradeScore: Number(gradeScore),
                gradeFeedback,
              },
            });
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Score (0–100) *
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              className="
                rounded-xl border border-border px-4 py-2.5 text-sm
                focus:border-primary focus:ring-2 focus:ring-primary/20
                focus:outline-none
              "
              value={gradeScore}
              onChange={(e) => setGradeScore(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Feedback
            </label>
            <textarea
              className="
                rounded-xl border border-border px-4 py-2.5 text-sm
                focus:border-primary focus:ring-2 focus:ring-primary/20
                focus:outline-none
              "
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              rows={3}
              placeholder="Feedback for the student..."
            />
          </div>
          <Button type="submit" fullWidth>
            Save Grade
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export default function AssignmentDetailPage() {
  const { id, assignmentId } = useParams<{
    id: string;
    assignmentId: string;
  }>();
  const courseId = Number(id);
  const aId = Number(assignmentId);
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === "TEACHER" || user?.role === "ADMIN";

  const { data: assignment, isLoading } = api.useQuery(
    "get",
    "/courses/{id}/assignments/{assignmentId}",
    { params: { path: { id: courseId, assignmentId: aId } } },
  );

  const [downloading, setDownloading] = useState(false);

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

  return (
    <div>
      <Link
        href={`/courses/${courseId}/assignments`}
        className="
          mb-4 inline-flex items-center gap-1.5 text-sm text-muted
          hover:text-foreground
        "
      >
        <ArrowLeft size={14} /> Back to Assignments
      </Link>

      {/* Assignment header */}
      {assignment && (
        <div className="
          mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm
        ">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="
                flex size-12 shrink-0 items-center justify-center rounded-xl
                bg-accent/10 text-accent
              ">
                <ClipboardList size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {assignment.title}
                </h1>
                {assignment.description && (
                  <p className="mt-1 text-sm text-muted">
                    {assignment.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                  {assignment.dueAt && (
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      Due:{" "}
                      {new Date(assignment.dueAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  <span>Posted by {assignment.createdByName}</span>
                </div>
              </div>
            </div>
            {assignment.fileUrl && (
              <button
                onClick={async () => {
                  setDownloading(true);
                  try {
                    await downloadAuthenticatedFile(
                      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/courses/${courseId}/assignments/${aId}/download`,
                      assignment.originalFileName || "assignment",
                    );
                  } catch {
                    toast.error("Download failed");
                  } finally {
                    setDownloading(false);
                  }
                }}
                disabled={downloading}
                className="
                  flex shrink-0 items-center gap-1.5 rounded-xl bg-surface px-3
                  py-2 text-sm font-semibold text-muted
                  hover:bg-border
                  disabled:opacity-50
                "
              >
                <Download size={14} /> Download
              </button>
            )}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-base font-bold text-foreground">
        {canManage ? "Student Submissions" : "Your Submission"}
      </h2>

      {canManage ? (
        <TeacherSubmissionsView courseId={courseId} assignmentId={aId} />
      ) : (
        <StudentAssignmentView courseId={courseId} assignmentId={aId} />
      )}
    </div>
  );
}
