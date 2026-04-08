"use client";

import Button from "@/components/Button";
import InputField from "@/components/InputField";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import api from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import useAuthStore from "@/store/authStore";
import { components } from "@universe/api-types";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const loginRequest: components["schemas"]["LoginRequest"] = {
    email,
    password,
  };

  const currentUserQuery = useCurrentUser();

  const loginMutation = api.useMutation("post", "/auth/login", {
    onMutate: () => {
      setIsLoggingIn(true);
    },

    onSuccess: async (data: components["schemas"]["LoginResponse"]) => {
      const { token, mustChangePassword } = data;

      if (!token) {
        toast.error("Login failed. No token received.");
        setIsLoggingIn(false);
        return;
      }

      if (mustChangePassword) {
        setToken(token);
        router.push("/auth/change-password");
        return;
      }

      setToken(token);

      await currentUserQuery.refetch();

      router.push("/");
    },

    onError: (error) => {
      const errorMessage = parseErrorMessage(
        error,
        "Unable to login. Please try again.",
      );
      setIsLoggingIn(false);
      toast.error(errorMessage);
    },
  });

  return (
    <div className="w-full">
      <h3 className="text-3xl font-bold tracking-tight text-foreground">
        Sign in
      </h3>

      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          loginMutation.mutate({ body: loginRequest });
        }}
      >
        <InputField
          label="Email address"
          type="email"
          placeholder="your@university.email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="your_password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="
                transition-colors
                hover:text-foreground
              "
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          }
        />

        <Link
          href="/auth/forgot-password"
          className="
            text-right text-base font-semibold text-primary transition-colors
            hover:text-primary-dark
          "
        >
          Forgot password?
        </Link>

        <Button
          fullWidth
          type="submit"
          disabled={isLoggingIn}
          className={clsx(
            isLoggingIn && `cursor-not-allowed text-muted opacity-50`,
          )}
        >
          {isLoggingIn ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
