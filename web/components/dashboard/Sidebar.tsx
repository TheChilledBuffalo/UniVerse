"use client";

import useAuthStore from "@/store/authStore";
import clsx from "clsx";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ("ADMIN" | "TEACHER" | "STUDENT")[];
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: <LayoutDashboard size={18} />,
      },
      {
        label: "My Courses",
        href: "/courses",
        icon: <BookOpen size={18} />,
      },
      {
        label: "Announcements",
        href: "/announcements",
        icon: <Bell size={18} />,
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: <Users size={18} />,
        roles: ["ADMIN"],
      },
      {
        label: "Courses",
        href: "/admin/courses",
        icon: <Settings size={18} />,
        roles: ["ADMIN"],
      },
      {
        label: "Enrollments",
        href: "/admin/enrollments",
        icon: <Shield size={18} />,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    items: [
      {
        label: "Profile",
        href: "/profile",
        icon: <User size={18} />,
      },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const userRole = user?.role as "ADMIN" | "TEACHER" | "STUDENT" | undefined;

  const handleLogout = async () => {
    try {
      const token = useAuthStore.getState().token;
      if (token) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/auth/logout`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    } catch {
      // Ignore network errors on logout
    }
    logout();
    router.push("/auth/login");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={clsx(
        `
          relative flex h-screen shrink-0 flex-col transition-all duration-300
          ease-in-out
        `,
        collapsed ? "w-[68px]" : "w-[260px]",
      )}
      style={{
        background:
          "linear-gradient(160deg, #4c1d95 0%, #6d28d9 60%, #7c3aed 100%)",
      }}
    >
      {/* Logo */}
      <div
        className={clsx(
          "flex items-center gap-3 px-4 py-5 select-none",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="
          flex size-9 shrink-0 items-center justify-center rounded-xl
          bg-white/20 backdrop-blur-sm
        ">
          <GraduationCap size={20} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-wide text-white">
            UniVerse
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="
          absolute top-6 -right-3 z-10 flex size-6 items-center justify-center
          rounded-full bg-white shadow-md transition-transform
          hover:scale-110
        "
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-primary" />
        ) : (
          <ChevronLeft size={12} className="text-primary" />
        )}
      </button>

      {/* User info */}
      {!collapsed && user && (
        <div className="mx-3 mb-4 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="
              flex size-8 shrink-0 items-center justify-center rounded-full
              bg-white/30 text-xs font-bold text-white
            ">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-white/60">{user.role}</p>
            </div>
          </div>
        </div>
      )}
      {collapsed && user && (
        <div className="mb-4 flex justify-center">
          <div className="
            flex size-8 items-center justify-center rounded-full bg-white/30
            text-xs font-bold text-white
          ">
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        {navSections.map((section, sIdx) => {
          const visibleItems = section.items.filter(
            (item) =>
              !item.roles || (userRole && item.roles.includes(userRole)),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="mb-2">
              {section.title && !collapsed && (
                <p className="
                  mb-1 px-3 text-[10px] font-semibold tracking-widest
                  text-white/40 uppercase
                ">
                  {section.title}
                </p>
              )}
              {visibleItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      `
                        group flex items-center gap-3 rounded-xl px-3 py-2.5
                        text-sm font-medium transition-all duration-150
                      `,
                      collapsed && "justify-center",
                      active
                        ? "bg-white/20 text-white shadow-sm"
                        : `
                          text-white/70
                          hover:bg-white/10 hover:text-white
                        `,
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && active && (
                      <span className="ml-auto size-1.5 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-2">
        <button
          onClick={handleLogout}
          className={clsx(
            `
              flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm
              font-medium text-white/70 transition-all
              hover:bg-white/10 hover:text-white
            `,
            collapsed && "justify-center",
          )}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
