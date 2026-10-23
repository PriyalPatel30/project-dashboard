import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ROLE_LABEL, errorMessage } from "@/lib/format";
import type { Person, Role } from "@/lib/types";
import { Avatar, Button, ErrorNote, Input, PageHeader, PageLoader, RoleBadge, Select, cx, useToast } from "@/components/ui";
import { RoleMatrix } from "@/components/RoleMatrix";

const ROLE_ORDER: Role[] = ["admin", "project_manager", "member", "viewer"];

export default function Users() {
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<Person[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authed" && user?.role !== "admin") navigate("/dashboard", { replace: true });
  }, [status, user, navigate]);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      api
        .get<Person[]>("/users", { params: q.trim() ? { search: q.trim() } : {} })
        .then((r) => alive && (setUsers(r.data), setError(null)))
        .catch((e) => alive && setError(errorMessage(e)));
    }, q ? 250 : 0);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  async function setRole(u: Person, role: Role) {
    const prev = users;
    setUsers((l) => (l ?? []).map((x) => (x._id === u._id ? { ...x, role } : x)));
    try {
      await api.put(`/users/${u._id}/role`, { role });
      toast(`${u.name} is now ${ROLE_LABEL[role].toLowerCase()}`);
    } catch (err) {
      setUsers(prev);
      toast(errorMessage(err), "error");
    }
  }

  if (user?.role !== "admin") return null;

  // Group users by role for summary stats
  const roleCounts = users
    ? ROLE_ORDER.reduce<Record<Role, number>>((acc, r) => {
        acc[r] = users.filter((u) => u.role === r).length;
        return acc;
      }, {} as Record<Role, number>)
    : null;

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage user roles and access across the platform."
      />

      {/* Role summary cards */}
      {roleCounts && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ROLE_ORDER.map((r) => {
            const colors: Record<Role, { bg: string; border: string; icon: string; text: string }> = {
              admin: { bg: "from-purple-950/40 to-surface", border: "border-purple-800/40", icon: "🛡️", text: "text-purple-300" },
              project_manager: { bg: "from-sky-950/40 to-surface", border: "border-sky-800/40", icon: "📋", text: "text-sky-300" },
              member: { bg: "from-emerald-950/40 to-surface", border: "border-emerald-800/40", icon: "👤", text: "text-emerald-300" },
              viewer: { bg: "from-slate-900/60 to-surface", border: "border-slate-800/40", icon: "👁️", text: "text-slate-300" },
            };
            const c = colors[r];
            return (
              <div key={r} className={cx("rounded-xl border bg-gradient-to-br p-3.5 shadow-2xs", c.bg, c.border)}>
                <div className="flex items-center justify-between">
                  <span className="text-lg">{c.icon}</span>
                  <span className={cx("text-xl font-bold", c.text)}>{roleCounts[r]}</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-muted">{ROLE_LABEL[r]}s</p>
              </div>
            );
          })}
        </div>
      )}

      <Input
        type="search"
        aria-label="Search users"
        placeholder="Search by name or email"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-5 max-w-sm"
      />

      {error && <ErrorNote message={error} />}
      {!users && !error && <PageLoader label="Loading users" />}
      {users && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface/90 shadow-2xs backdrop-blur-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-wash/50 text-[13px] text-muted">
                  <th className="px-5 py-3.5 font-semibold">Person</th>
                  <th className="px-5 py-3.5 font-semibold">Current Role</th>
                  <th className="px-5 py-3.5 font-semibold">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-line/70 last:border-0 transition-colors hover:bg-wash/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar person={u} size={36} />
                        <div>
                          <p className="font-semibold text-ink">
                            {u.name}
                            {u._id === user._id && (
                              <span className="ml-2 rounded bg-accent-wash px-1.5 py-0.5 text-[11px] font-semibold text-accent-strong">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role ?? "viewer"} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Select
                        aria-label={`Role for ${u.name}`}
                        value={u.role}
                        disabled={u._id === user._id}
                        onChange={(e) => setRole(u, e.target.value as Role)}
                        className="h-9 w-auto min-w-44"
                      >
                        <option value="viewer">👁️ Viewer</option>
                        <option value="member">👤 Member</option>
                        <option value="project_manager">📋 Project Manager</option>
                        <option value="admin">🛡️ Admin</option>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">
            Shows up to 50 people. Search to find someone specific. You can&apos;t change your own role.
          </p>
          <h2 className="mt-10 mb-3 text-lg font-bold">What each role can do</h2>
          <RoleMatrix current={user.role} />
        </>
      )}
    </>
  );
}
