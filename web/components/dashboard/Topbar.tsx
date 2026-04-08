"use client";

import useAuthStore from "@/store/authStore";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/courses": "My Courses",
  "/announcements": "Announcements",
  "/profile": "Profile",
  "/admin/users": "User Management",
  "/admin/courses": "Course Management",
  "/admin/enrollments": "Enrollment Management",
};

function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/courses/") && pathname.includes("/notes"))
    return "Course Notes";
  if (pathname.startsWith("/courses/") && pathname.includes("/assignments"))
    return "Assignments";
  if (pathname.startsWith("/courses/") && pathname.includes("/forum"))
    return "Course Forum";
  if (pathname.startsWith("/courses/")) return "Course Details";
  return "UniVerse";
}

export default function Topbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const title = getPageTitle(pathname);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="
      flex h-16 shrink-0 items-center justify-between border-b border-border
      bg-white px-6 shadow-sm
    ">
      <div>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <p className="
            hidden text-sm text-muted
            sm:block
          ">
            {greeting()}, {user.name?.split(" ")[0]}!
          </p>
        )}
        <button
          className="
            relative flex size-9 items-center justify-center rounded-xl
            bg-surface text-muted transition-colors
            hover:bg-border hover:text-foreground
          "
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        {user && (
          <div className="
            flex size-9 items-center justify-center rounded-xl bg-primary
            text-sm font-bold text-white
          ">
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>
    </header>
  );
}
