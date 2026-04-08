"use client";

import Button from "@/components/Button";
import InputField from "@/components/InputField";
import api from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import { components } from "@universe/api-types";
import clsx from "clsx";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error(
        "Invalid or missing token. Please try resetting your password again.",
      );
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  const resetPasswordRequest: components["schemas"]["ResetPasswordTokenRequest"] =
    {
      token,
      newPassword,
    };

  const resetPasswordMutation = api.useMutation(
    "post",
    "/auth/reset-password-token",
    {
      onMutate: () => {
        setIsSubmitting(true);
      },

      onSuccess: () => {
        toast.success(
          "Your password has been reset successfully. Please login with your new password.",
        );
        router.push("/auth/login");
      },

      onError: (error) => {
        setIsSubmitting(false);

        const errorMessage = parseErrorMessage(
          error,
          "Unable to reset password. Please try again.",
        );
        toast.error(errorMessage);
      },
    },
  );

  return (
    <div className="w-full">
      <h3 className="text-3xl font-bold tracking-tight text-foreground">
        Reset password
      </h3>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();

          if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match. Please try again.");
            return;
          }

          resetPasswordMutation.mutate({ body: resetPasswordRequest });
        }}
      >
        <InputField
          label="New password"
          type="password"
          required
          placeholder="Your new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <InputField
          label="Confirm password"
          type="password"
          required
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          fullWidth
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "mt-2",
            isSubmitting && "cursor-not-allowed text-muted opacity-50",
          )}
        >
          {isSubmitting ? "Resetting password..." : "Reset password"}
        </Button>
      </form>

      <Link
        href="/auth/login"
        className="
          absolute mt-5 text-base font-semibold text-primary transition-colors
          hover:text-primary-dark
        "
      >
        Back to Login
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-muted">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
