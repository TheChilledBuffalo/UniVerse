"use client";

import Button from "@/components/Button";
import InputField from "@/components/InputField";
import api from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import useAuthStore from "@/store/authStore";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // If somehow a user lands here without a token, bounce them to login
    if (!token) {
      router.replace("/auth/login");
    }
  }, [token, router]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const setToken = useAuthStore((state) => state.setToken);

  const changePassword = api.useMutation("post", "/auth/reset-password", {
    onSuccess: () => {
      toast.success("Password changed successfully! Please log in again.");
      setSaving(false);

      // After changing a forced password, we clear the token and force an explicit relogin for security.
      setToken("");
      router.push("/auth/login");
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

  return (
    <div className="w-full max-w-md">
      <h3 className="text-3xl font-bold tracking-tight text-foreground">
        Change Password
      </h3>
      <p className="mt-2 text-sm text-muted">
        Your account requires a password change before you can access the
        portal.
      </p>

      <form
        onSubmit={handlePasswordChange}
        className="mt-8 flex flex-col gap-4"
      >
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

        <Button
          fullWidth
          type="submit"
          disabled={saving}
          className={clsx(saving && `cursor-not-allowed opacity-50`)}
        >
          {saving ? "Saving..." : "Change Password"}
        </Button>
      </form>
    </div>
  );
}
