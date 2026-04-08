"use client";

import Button from "@/components/Button";
import EmptyState from "@/components/dashboard/EmptyState";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import InputField from "@/components/InputField";
import api from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import useAuthStore from "@/store/authStore";
import { components } from "@universe/api-types";
import { Bell, Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type Announcement = components["schemas"]["AnnouncementResponse"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function AnnouncementCard({
  ann,
  canEdit,
  onEdit,
  onDelete,
}: {
  ann: Announcement;
  canEdit: boolean;
  onEdit: (a: Announcement) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="
      rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow
      hover:shadow-md
    ">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="
            flex size-10 shrink-0 items-center justify-center rounded-xl
            bg-primary/10 text-primary
          ">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{ann.title}</h3>
            <p className="mt-1 text-sm/relaxed text-muted">{ann.content}</p>
            <p className="mt-2 text-xs text-muted">
              Posted by{" "}
              <strong className="text-foreground">{ann.postedBy}</strong> ·{" "}
              {formatDate(ann.createdAt)}
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => onEdit(ann)}
              className="
                flex size-8 items-center justify-center rounded-lg text-muted
                transition-colors
                hover:bg-primary/10 hover:text-primary
              "
              title="Edit"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => onDelete(ann.id)}
              className="
                flex size-8 items-center justify-center rounded-lg text-muted
                transition-colors
                hover:bg-error/10 hover:text-error
              "
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const user = useAuthStore((s) => s.user);
  const canCreate = user?.role === "ADMIN";

  const [showCreate, setShowCreate] = useState(false);
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const {
    data: announcements,
    isLoading,
    refetch,
  } = api.useQuery("get", "/announcements");

  const createAnn = api.useMutation("post", "/announcements", {
    onSuccess: () => {
      toast.success("Announcement posted!");
      setShowCreate(false);
      setTitle("");
      setContent("");
      refetch();
    },
    onError: (e) =>
      toast.error(parseErrorMessage(e, "Failed to post announcement")),
  });

  const updateAnn = api.useMutation("put", "/announcements/{id}", {
    onSuccess: () => {
      toast.success("Announcement updated!");
      setEditAnn(null);
      setTitle("");
      setContent("");
      refetch();
    },
    onError: (e) =>
      toast.error(parseErrorMessage(e, "Failed to update announcement")),
  });

  const deleteAnn = api.useMutation("delete", "/announcements/{id}", {
    onSuccess: () => {
      toast.success("Announcement deleted");
      refetch();
    },
    onError: (e) =>
      toast.error(parseErrorMessage(e, "Failed to delete announcement")),
  });

  const openEdit = (ann: Announcement) => {
    setEditAnn(ann);
    setTitle(ann.title);
    setContent(ann.content);
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Campus-wide announcements and updates"
        action={
          canCreate ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-1.5 inline" />
              New Announcement
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="
            size-8 animate-spin rounded-full border-2 border-border
            border-t-primary
          " />
        </div>
      ) : !announcements || announcements.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} />}
          title="No announcements yet"
          description={
            canCreate ? "Create the first announcement." : "Nothing posted yet."
          }
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <AnnouncementCard
              key={ann.id}
              ann={ann}
              canEdit={canCreate}
              onEdit={openEdit}
              onDelete={(id) => deleteAnn.mutate({ params: { path: { id } } })}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Announcement"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createAnn.mutate({ body: { title, content } });
          }}
          className="flex flex-col gap-4"
        >
          <InputField
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Content *
            </label>
            <textarea
              className="
                rounded-xl border border-border px-4 py-2.5 text-sm
                focus:border-primary focus:ring-2 focus:ring-primary/20
                focus:outline-none
              "
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              placeholder="Write your announcement..."
            />
          </div>
          <Button type="submit" fullWidth>
            Post Announcement
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editAnn}
        onClose={() => setEditAnn(null)}
        title="Edit Announcement"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editAnn) return;
            updateAnn.mutate({
              params: { path: { id: editAnn.id } },
              body: { title, content },
            });
          }}
          className="flex flex-col gap-4"
        >
          <InputField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              Content
            </label>
            <textarea
              className="
                rounded-xl border border-border px-4 py-2.5 text-sm
                focus:border-primary focus:ring-2 focus:ring-primary/20
                focus:outline-none
              "
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write your announcement..."
            />
          </div>
          <Button type="submit" fullWidth>
            Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}
