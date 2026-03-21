import Button from "@/components/Button";
import InputField from "@/components/InputField";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="w-full">
      <h3 className="text-3xl font-bold tracking-tight text-foreground">
        Reset password
      </h3>

      <form className="mt-5 flex flex-col gap-4">
        <InputField
          label="New password"
          type="password"
          placeholder="Your new password"
        />

        <InputField
          label="Confirm password"
          type="password"
          placeholder="Confirm password"
        />

        <Button fullWidth className="mt-2">
          Reset password
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
