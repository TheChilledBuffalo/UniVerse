"use client";

import Button from "@/components/Button";
import DataTable, { Column } from "@/components/dashboard/DataTable";
import EmptyState from "@/components/dashboard/EmptyState";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import InputField from "@/components/InputField";
import api from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import useAuthStore from "@/store/authStore";
import { components } from "@universe/api-types";
import { Edit2, Plus, Trash2, Upload, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type User = components["schemas"]["UserResponse"];
type Role = "ADMIN" | "TEACHER" | "STUDENT";
type Department = components["schemas"]["CreateUserRequest"]["department"];

const DEPARTMENTS: Department[] = [
  "ComputerScience",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Literature",
  "History",
  "Philosophy",
  "Economics",
  "Psychology",
  "MechanicalEngineering",
  "ElectricalEngineering",
  "CivilEngineering",
  "BusinessAdministration",
  "Art",
  "Music",
  "Law",
  "Medicine",
];

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-error/10 text-error",
    TEACHER: "bg-primary/10 text-primary",
    STUDENT: "bg-success/10 text-success",
  };
  return (
    <span
      className={`
        inline-block rounded-lg px-2 py-0.5 text-xs font-semibold
        ${styles[role] ?? `bg-surface text-muted`}
      `}
    >
      {role}
    </span>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (currentUser && currentUser.role !== "ADMIN") {
      router.replace("/");
    }
  }, [currentUser, router]);

  const {
    data: users,
    isLoading,
    refetch,
  } = api.useQuery("get", "/admin/users");

  // Create user form
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [department, setDepartment] = useState<Department>("ComputerScience");

  // CSV upload
  const csvRef = useRef<HTMLInputElement>(null);

  const createUser = api.useMutation("post", "/admin/user", {
    onSuccess: () => {
      toast.success("User created!");
      setShowCreate(false);
      resetForm();
      refetch();
    },
    onError: (e) => toast.error(parseErrorMessage(e, "Failed to create user")),
  });

  const updateUser = api.useMutation("put", "/admin/user/{id}", {
    onSuccess: () => {
      toast.success("User updated!");
      setEditUser(null);
      resetForm();
      refetch();
    },
    onError: (e) => toast.error(parseErrorMessage(e, "Failed to update user")),
  });

  const deleteUser = api.useMutation("delete", "/admin/user/{id}", {
    onSuccess: () => {
      toast.success("User deleted");
      refetch();
    },
    onError: (e) => toast.error(parseErrorMessage(e, "Failed to delete user")),
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("STUDENT");
    setDepartment("ComputerScience");
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role as Role);
    setDepartment((u.department as Department) ?? "ComputerScience");
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = useAuthStore.getState().token;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/admin/users/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Users uploaded from CSV!");
      refetch();
    } catch (e) {
      toast.error(parseErrorMessage(e, "CSV upload failed"));
    } finally {
      if (csvRef.current) csvRef.current.value = "";
    }
  };

  const columns: Column<User>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (u) => <RoleBadge role={u.role} />,
    },
    {
      key: "department",
      label: "Department",
      render: (u) => <span className="text-muted">{u.department ?? "—"}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(u)}
            className="
              flex size-7 items-center justify-center rounded-lg text-muted
              transition-colors
              hover:bg-primary/10 hover:text-primary
            "
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() =>
              deleteUser.mutate({ params: { path: { id: u.id } } })
            }
            className="
              flex size-7 items-center justify-center rounded-lg text-muted
              transition-colors
              hover:bg-error/10 hover:text-error
            "
            title="Delete"
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
        title="User Management"
        description="Create, edit, and manage all users"
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
                whitespace-nowrap text-muted shadow-sm transition-colors
                hover:border-primary hover:text-primary
              "
            >
              <Upload size={15} /> Import CSV
            </button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-1.5 inline" />
              Add User
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
      ) : !users || users.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No users yet"
          description="Add users manually or import a CSV."
        />
      ) : (
        <DataTable columns={columns} data={users as User[]} keyField="id" />
      )}

      {/* Create User Modal */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          resetForm();
        }}
        title="Add User"
        maxWidth="lg"
      >
        <UserForm
          name={name}
          email={email}
          role={role}
          department={department}
          onName={setName}
          onEmail={setEmail}
          onRole={setRole}
          onDepartment={setDepartment}
          onSubmit={(e) => {
            e.preventDefault();
            createUser.mutate({
              body: { name, email, role, department },
            });
          }}
          submitLabel="Create User"
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={!!editUser}
        onClose={() => {
          setEditUser(null);
          resetForm();
        }}
        title={`Edit — ${editUser?.name}`}
        maxWidth="lg"
      >
        <UserForm
          name={name}
          email={email}
          role={role}
          department={department}
          onName={setName}
          onEmail={setEmail}
          onRole={setRole}
          onDepartment={setDepartment}
          onSubmit={(e) => {
            e.preventDefault();
            if (!editUser) return;
            updateUser.mutate({
              params: { path: { id: editUser.id } },
              body: {
                ...(name !== editUser.name ? { name } : {}),
                ...(email !== editUser.email ? { email } : {}),
                ...(role !== editUser.role ? { role } : {}),
                ...(department !== (editUser.department ?? "ComputerScience")
                  ? { department }
                  : {}),
              },
            });
          }}
          submitLabel="Save Changes"
        />
      </Modal>
    </div>
  );
}

function UserForm({
  name,
  email,
  role,
  department,
  onName,
  onEmail,
  onRole,
  onDepartment,
  onSubmit,
  submitLabel,
}: {
  name: string;
  email: string;
  role: Role;
  department: Department;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onRole: (v: Role) => void;
  onDepartment: (v: Department) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Full Name *"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Jane Doe"
          required
        />
        <InputField
          label="Email *"
          type="email"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          placeholder="jane@university.edu"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-foreground">
            Role *
          </label>
          <select
            className="
              rounded-xl border border-border px-4 py-3 text-sm
              focus:border-primary focus:ring-2 focus:ring-primary/20
              focus:outline-none
            "
            value={role}
            onChange={(e) => onRole(e.target.value as Role)}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-foreground">
            Department
          </label>
          <select
            className="
              rounded-xl border border-border px-4 py-3 text-sm
              focus:border-primary focus:ring-2 focus:ring-primary/20
              focus:outline-none
            "
            value={department ?? ""}
            onChange={(e) => onDepartment(e.target.value as Department)}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button type="submit" fullWidth>
        {submitLabel}
      </Button>
    </form>
  );
}
