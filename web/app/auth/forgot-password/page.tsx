"use client";

import Button from "@/components/Button";
import InputField from "@/components/InputField";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full">
      <h3 className="text-3xl font-bold tracking-tight text-foreground">
        Forgot password
      </h3>

      <p className="mt-4 text-base text-foreground/80">
        Enter your email address and check your inbox.
      </p>

      <form className="mt-5 flex flex-col gap-4">
        <InputField
          label="Email address"
          type="email"
          placeholder="your@university.email"
        />

        <Button fullWidth className="mt-2">
          Receive email
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
