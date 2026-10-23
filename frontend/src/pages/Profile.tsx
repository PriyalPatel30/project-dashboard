import { useAuth } from "@/lib/auth";
import { Avatar, Button, PageHeader, RoleBadge, cx } from "@/components/ui";
import { RoleMatrix } from "@/components/RoleMatrix";
import { ROLE_LABEL, ROLE_SUMMARY, canEdit } from "@/lib/format";

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  admin: { bg: "from-purple-950/40 to-indigo-950/40", border: "border-purple-800/50", text: "text-purple-300", icon: "🛡️" },
  project_manager: { bg: "from-sky-950/40 to-cyan-950/40", border: "border-sky-800/50", text: "text-sky-300", icon: "📋" },
  member: { bg: "from-emerald-950/40 to-teal-950/40", border: "border-emerald-800/50", text: "text-emerald-300", icon: "👤" },
  viewer: { bg: "from-slate-900/60 to-gray-900/60", border: "border-slate-800/50", text: "text-slate-300", icon: "👁️" },
};

export default function Profile() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const role = user.role ?? "viewer";
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.viewer;
  const editable = canEdit(user);

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account details and permissions." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Identity card */}
        <section className="rounded-2xl border border-line bg-surface/90 shadow-2xs backdrop-blur-sm p-6">
          <div className="flex items-center gap-4">
            <Avatar person={user} size={64} />
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>

          <dl className="mt-6 divide-y divide-line text-sm">
            <div className="flex items-center justify-between py-3">
              <dt className="text-muted font-medium">System role</dt>
              <dd><RoleBadge role={role} /></dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-muted font-medium">Access level</dt>
              <dd className="text-right max-w-xs">
                {editable ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    Read & Write
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/50 border border-amber-800/60 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                    <span className="size-1.5 rounded-full bg-amber-400" />
                    Read Only
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <Button onClick={logout} variant="ghost" className="text-danger hover:text-danger">Sign out</Button>
          </div>
        </section>

        {/* Role summary card */}
        <section className={cx(
          "rounded-2xl border bg-gradient-to-br p-6 shadow-2xs",
          colors.bg, colors.border
        )}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{colors.icon}</span>
            <div>
              <h3 className={cx("text-lg font-bold", colors.text)}>{ROLE_LABEL[role]}</h3>
              <p className="text-sm text-muted">{ROLE_SUMMARY[role]}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {role === "admin" && (
              <>
                <PermRow allowed label="Manage all users and assign roles" />
                <PermRow allowed label="Create, edit, and delete any project" />
                <PermRow allowed label="Create, edit, and delete any task" />
                <PermRow allowed label="View all projects and tasks" />
                <PermRow allowed label="Comment on any task" />
              </>
            )}
            {role === "project_manager" && (
              <>
                <PermRow allowed label="Create projects and manage teams" />
                <PermRow allowed label="Create, assign, edit, and delete tasks" />
                <PermRow allowed label="Change task status in your projects" />
                <PermRow allowed label="Comment on tasks in your projects" />
                <PermRow denied label="Manage user roles (admin only)" />
              </>
            )}
            {role === "member" && (
              <>
                <PermRow allowed label="View projects you belong to" />
                <PermRow allowed label="Update tasks assigned to you" />
                <PermRow allowed label="Change status of your assigned tasks" />
                <PermRow allowed label="Comment on tasks in your projects" />
                <PermRow denied label="Create or delete tasks" />
                <PermRow denied label="Manage project teams" />
              </>
            )}
            {role === "viewer" && (
              <>
                <PermRow allowed label="View projects and tasks you belong to" />
                <PermRow denied label="Create, edit, or delete anything" />
                <PermRow denied label="Comment on tasks" />
                <PermRow denied label="Change task status" />
              </>
            )}
          </div>

          {role === "viewer" && (
            <p className="mt-4 text-xs text-muted border-t border-line/50 pt-3">
              💡 Ask an Admin or Project Manager to add you to a project with a higher role.
            </p>
          )}
        </section>
      </div>

      <h2 className="mt-10 mb-3 text-lg font-bold">Full permissions matrix</h2>
      <RoleMatrix current={role} />
    </>
  );
}

function PermRow({ allowed, label }: { allowed?: boolean; denied?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      {allowed ? (
        <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m4.5 10.5 3.5 3.5 7.5-8" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      )}
      <span className={allowed ? "text-ink" : "text-muted"}>{label}</span>
    </div>
  );
}
