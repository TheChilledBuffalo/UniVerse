"use client";

import CourseCard from "@/components/dashboard/CourseCard";
import StatCard from "@/components/dashboard/StatCard";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import { components } from "@universe/api-types";
import {
  Bell,
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  Users,
} from "lucide-react";

type Announcement = components["schemas"]["AnnouncementResponse"];
type Course = components["schemas"]["CourseResponse"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AnnouncementItem({ ann }: { ann: Announcement }) {
  return (
    <div className="
      flex gap-3 rounded-xl border border-border bg-white p-4 shadow-sm
    ">
      <div className="
        flex size-9 shrink-0 items-center justify-center rounded-xl
        bg-primary/10 text-primary
      ">
        <Bell size={16} />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-foreground">{ann.title}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted">{ann.content}</p>
        <p className="mt-1 text-xs text-muted">
          {ann.postedBy} · {formatDate(ann.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ---------- STUDENT DASHBOARD ----------
function StudentDashboard({ courses }: { courses: Course[] }) {
  const { data: announcements } = api.useQuery("get", "/announcements");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="
        grid grid-cols-1 gap-4
        sm:grid-cols-2
        lg:grid-cols-3
      ">
        <StatCard
          label="Enrolled Courses"
          value={courses.length}
          icon={<BookOpen size={22} />}
          color="primary"
          subtext="Active this semester"
        />
        <StatCard
          label="Announcements"
          value={announcements?.length ?? 0}
          icon={<Bell size={22} />}
          color="accent"
          subtext="Campus wide"
        />
        <StatCard
          label="Courses with Assignments"
          value={courses.length}
          icon={<CheckCircle size={22} />}
          color="success"
          subtext="Check each course"
        />
      </div>

      {/* My Courses */}
      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">My Courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-muted">
            You are not enrolled in any courses yet.
          </p>
        ) : (
          <div className="
            grid grid-cols-1 gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          ">
            {courses.slice(0, 6).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>

      {/* Announcements */}
      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">
          Recent Announcements
        </h2>
        {!announcements || announcements.length === 0 ? (
          <p className="text-sm text-muted">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 4).map((ann) => (
              <AnnouncementItem key={ann.id} ann={ann} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ---------- TEACHER DASHBOARD ----------
function TeacherDashboard({ courses }: { courses: Course[] }) {
  const { data: announcements } = api.useQuery("get", "/announcements");

  const totalMaxStudents = courses.reduce((sum, c) => sum + c.maxStudents, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="
        grid grid-cols-1 gap-4
        sm:grid-cols-2
        lg:grid-cols-3
      ">
        <StatCard
          label="Courses Teaching"
          value={courses.length}
          icon={<BookOpen size={22} />}
          color="primary"
          subtext="This semester"
        />
        <StatCard
          label="Max Capacity"
          value={totalMaxStudents}
          icon={<Users size={22} />}
          color="success"
          subtext="Total across courses"
        />
        <StatCard
          label="Announcements"
          value={announcements?.length ?? 0}
          icon={<Bell size={22} />}
          color="accent"
          subtext="Campus wide"
        />
      </div>

      {/* My Courses */}
      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">My Courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-muted">No courses assigned yet.</p>
        ) : (
          <div className="
            grid grid-cols-1 gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          ">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>

      {/* Announcements */}
      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">
          Recent Announcements
        </h2>
        {!announcements || announcements.length === 0 ? (
          <p className="text-sm text-muted">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <AnnouncementItem key={ann.id} ann={ann} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ---------- ADMIN DASHBOARD ----------
function AdminDashboard() {
  const { data: users } = api.useQuery("get", "/admin/users");
  const { data: courses } = api.useQuery("get", "/admin/courses");
  const { data: announcements } = api.useQuery("get", "/announcements");

  const roleCount = (role: string) =>
    users?.filter((u) => u.role === role).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="
        grid grid-cols-1 gap-4
        sm:grid-cols-2
        lg:grid-cols-4
      ">
        <StatCard
          label="Total Users"
          value={users?.length ?? 0}
          icon={<Users size={22} />}
          color="primary"
        />
        <StatCard
          label="Students"
          value={roleCount("STUDENT")}
          icon={<GraduationCap size={22} />}
          color="success"
        />
        <StatCard
          label="Teachers"
          value={roleCount("TEACHER")}
          icon={<BookOpen size={22} />}
          color="accent"
        />
        <StatCard
          label="Total Courses"
          value={courses?.length ?? 0}
          icon={<Clock size={22} />}
          color="warning"
        />
      </div>

      {/* Recent Users */}
      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">
          Recent Users
        </h2>
        <div className="
          overflow-hidden rounded-2xl border border-border bg-white shadow-sm
        ">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="
                  px-4 py-3 text-left text-xs font-semibold tracking-wider
                  text-muted uppercase
                ">
                  Name
                </th>
                <th className="
                  px-4 py-3 text-left text-xs font-semibold tracking-wider
                  text-muted uppercase
                ">
                  Email
                </th>
                <th className="
                  px-4 py-3 text-left text-xs font-semibold tracking-wider
                  text-muted uppercase
                ">
                  Role
                </th>
                <th className="
                  px-4 py-3 text-left text-xs font-semibold tracking-wider
                  text-muted uppercase
                ">
                  Department
                </th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).slice(0, 6).map((u) => (
                <tr
                  key={u.id}
                  className="
                    border-b border-border/60
                    last:border-0
                    hover:bg-surface/50
                  "
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {u.department ?? "—"}
                  </td>
                </tr>
              ))}
              {!users && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent courses */}
      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">
          All Courses
        </h2>
        {courses && courses.length > 0 ? (
          <div className="
            grid grid-cols-1 gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          ">
            {courses.slice(0, 6).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No courses yet.</p>
        )}
      </section>

      {/* Announcements */}
      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">
          Recent Announcements
        </h2>
        {!announcements || announcements.length === 0 ? (
          <p className="text-sm text-muted">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <AnnouncementItem key={ann.id} ann={ann} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-error/10 text-error",
    TEACHER: "bg-primary/10 text-primary",
    STUDENT: "bg-success/10 text-success",
  };
  return (
    <span
      className={`
        inline-block rounded-lg px-2 py-0.5 text-xs font-semibold
        ${styles[role] ?? `bg-surface text-muted`}
      `}
    >
      {role}
    </span>
  );
}

function WelcomeBanner({
  user,
}: {
  user: components["schemas"]["MeResponse"];
}) {
  return (
    <div
      className="mb-6 flex items-center gap-4 rounded-2xl p-5 text-white"
      style={{
        background:
          "linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #8b5cf6 100%)",
      }}
    >
      <div className="
        flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20
        text-xl font-bold backdrop-blur-sm
      ">
        {user.name?.[0]?.toUpperCase()}
      </div>
      <div>
        <h2 className="text-lg font-bold">Welcome back, {user.name}! 👋</h2>
        <p className="text-sm text-white/70">
          {user.role === "ADMIN"
            ? "System Administrator"
            : user.role === "TEACHER"
              ? `Teacher · ${user.department ?? ""}`
              : `Student · ${user.department ?? ""}`}
        </p>
      </div>
    </div>
  );
}

// ---------- ROOT PAGE ----------
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: courses, isLoading: coursesLoading } = api.useQuery(
    "get",
    "/courses",
  );

  if (!user) return null;

  if (coursesLoading && user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="
          size-8 animate-spin rounded-full border-2 border-border
          border-t-primary
        " />
      </div>
    );
  }

  return (
    <div>
      <WelcomeBanner user={user} />
      {user.role === "ADMIN" ? (
        <AdminDashboard />
      ) : user.role === "TEACHER" ? (
        <TeacherDashboard courses={courses ?? []} />
      ) : (
        <StudentDashboard courses={courses ?? []} />
      )}
    </div>
  );
}
