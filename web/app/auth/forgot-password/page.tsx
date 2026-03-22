"use client";

import Button from "@/components/Button";
import InputField from "@/components/InputField";
import api from "@/lib/api";
import { components } from "@universe/api-types";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

function parseErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }

    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
  }

  return "Unable to send reset password email. Please try again.";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const forgotPasswordRequest: components["schemas"]["ForgotPasswordRequest"] =
    {
      email,
    };

  const forgotPasswordMutation = api.useMutation(
    "post",
    "/auth/forgot-password",
    {
      onSuccess: () => {
        toast.success("An email has been sent to your inbox.");
      },

      onError: (error) => {
        const errorMessage = parseErrorMessage(error);
        toast.error(errorMessage);
      },
    },
  );

  return (
    <div className="w-full">
      <h3 className="text-3xl font-bold tracking-tight text-foreground">
        Forgot password
      </h3>

      <p className="mt-4 text-base text-foreground/80">
        Enter your email address and check your inbox.
      </p>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          forgotPasswordMutation.mutate({ body: forgotPasswordRequest });
        }}
      >
        <InputField
          label="Email address"
          type="email"
          placeholder="your@university.email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          type="submit"
          fullWidth
          className={clsx(
            "mt-2",
            forgotPasswordMutation.isPending && "cursor-not-allowed opacity-50",
          )}
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending
            ? "Sending email..."
            : "Receive email"}
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
