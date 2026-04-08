"use client";

import Button from "@/components/Button";
import InputField from "@/components/InputField";
import PageHeader from "@/components/dashboard/PageHeader";
import api from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import useAuthStore from "@/store/authStore";
import clsx from "clsx";
import { Building2, Eye, EyeOff, Lock, Mail, Shield, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="
      flex items-center gap-3 rounded-xl border border-border bg-surface px-4
      py-3
    ">
      <div className="
        flex size-9 shrink-0 items-center justify-center rounded-lg
        bg-primary/10 text-primary
      ">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const changePassword = api.useMutation("post", "/auth/reset-password", {
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaving(false);
    },
    onError: (e) => {
      setSaving(false);
      toast.error(parseErrorMessage(e, "Failed to change password"));
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    changePassword.mutate({
      body: { currentPassword, newPassword },
    });
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="My Profile"
        description="Your account information and settings"
      />

      {/* Avatar + name banner */}
      <div
        className="mb-6 flex items-center gap-5 rounded-2xl p-6 text-white"
        style={{
          background:
            "linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #8b5cf6 100%)",
        }}
      >
        <div className="
          flex size-16 shrink-0 items-center justify-center rounded-2xl
          bg-white/20 text-2xl font-bold backdrop-blur-sm
        ">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-white/70">{user.email}</p>
          <span
            className={clsx(
              "mt-2 inline-block rounded-lg px-2.5 py-0.5 text-xs font-semibold",
              "bg-white/20 text-white",
            )}
          >
            {user.role}
          </span>
        </div>
      </div>

      {/* Info fields */}
      <div className="
        mb-6 grid grid-cols-1 gap-3
        sm:grid-cols-2
      ">
        <InfoRow
          icon={<User size={16} />}
          label="Full Name"
          value={user.name}
        />
        <InfoRow icon={<Mail size={16} />} label="Email" value={user.email} />
        <InfoRow icon={<Shield size={16} />} label="Role" value={user.role} />
        <InfoRow
          icon={<Building2 size={16} />}
          label="Department"
          value={user.department}
        />
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Lock size={18} className="text-primary" />
          <h3 className="font-bold text-foreground">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <InputField
            label="Current Password"
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Your current password"
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                className="
                  transition-colors
                  hover:text-foreground
                "
                aria-label={showCurrent ? "Hide" : "Show"}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <InputField
            label="New Password"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="
                  transition-colors
                  hover:text-foreground
                "
                aria-label={showNew ? "Hide" : "Show"}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <InputField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            required
          />

          <Button type="submit" fullWidth disabled={saving}>
            {saving ? "Saving..." : "Change Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
