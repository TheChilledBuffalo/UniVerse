import { GraduationCap } from "lucide-react";
import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen grid-cols-2">
      <section className="
        flex h-full flex-col justify-between bg-primary p-8 text-surface
        select-none
      ">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
            <GraduationCap />
          </div>
          <h1 className="text-xl font-semibold tracking-wide">UniVerse</h1>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-bold">Welcome to your campus portal!</h2>
          <h4 className="text-base opacity-70">Login to continue.</h4>
        </div>
        <p className="opacity-60">&copy; UniVerse 2026</p>
      </section>

      <section className="flex items-center justify-center px-24">
        {children}
      </section>
    </main>
  );
}
