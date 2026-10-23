import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { daysFromToday, dueLabel, isDone } from "@/lib/format";
import type { Project, Task } from "@/lib/types";
import { useFetch } from "@/lib/useFetch";
import { EmptyState, ErrorNote, PageLoader, PriorityBadge, StageBar, cx } from "@/components/ui";

interface Row {
  project: Project;
  tasks: Task[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error, reload } = useFetch<Row[]>(async () => {
    const { data: projects } = await api.get<Project[]>("/projects");
    return Promise.all(
      projects
        .filter((p) => !p.isArchived)
        .map(async (project) => ({
          project,
          tasks: await api.get<Task[]>(`/projects/${project._id}/tasks`).then((r) => r.data).catch(() => []),
        }))
    );
  });

  if (error && !data) return <ErrorNote message={error} onRetry={reload} />;
  if (!data) return <PageLoader label="Loading dashboard" />;

  const mine = data
    .flatMap(({ project, tasks }) => tasks.filter((t) => t.assignees.some((a) => a._id === user?._id) && !isDone(t, project)).map((t) => ({ t, project })))
    .sort((a, b) => (a.t.dueDate ?? "9999").localeCompare(b.t.dueDate ?? "9999"));
  const overdue = mine.filter(({ t }) => t.dueDate && daysFromToday(t.dueDate) < 0).length;
  const thisWeek = mine.filter(({ t }) => t.dueDate && daysFromToday(t.dueDate) >= 0 && daysFromToday(t.dueDate) <= 7).length;
  const first = user?.name.split(" ")[0] ?? "there";

  const headline =
    mine.length === 0
      ? "You're all caught up!"
      : overdue > 0
        ? `${overdue} of your tasks ${overdue === 1 ? "is" : "are"} overdue.`
        : thisWeek > 0
          ? `${thisWeek} ${thisWeek === 1 ? "task is" : "tasks are"} due this week.`
          : `${mine.length} open ${mine.length === 1 ? "task" : "tasks"} assigned to you.`;

  return (
    <>
      {/* Header & Greeting */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-line bg-gradient-to-r from-accent-wash/60 via-surface to-surface p-6 sm:p-8 shadow-xs">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-strong">
            <span className="size-1.5 rounded-full bg-accent animate-pulse" /> Welcome back, {first}
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-ink">
            {headline}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here is a summary of your workspace activity and current deliverables.
          </p>
        </div>
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-gradient-to-br from-accent/20 to-purple-400/20 blur-2xl" />
      </div>

      {/* Colorful KPI Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card-elevated rounded-2xl border border-indigo-900/40 bg-gradient-to-br from-indigo-950/40 to-surface p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Assigned</span>
            <span className="grid size-8 place-items-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <svg viewBox="0 0 20 20" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2Z" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-ink">{mine.length}</p>
          <p className="text-xs text-muted">Open tasks for you</p>
        </div>

        <div className="card-elevated rounded-2xl border border-amber-900/40 bg-gradient-to-br from-amber-950/40 to-surface p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Due Soon</span>
            <span className="grid size-8 place-items-center rounded-xl bg-amber-500/15 text-amber-400">
              <svg viewBox="0 0 20 20" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="7" />
                <path d="M10 6v4l2.5 1.5" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-ink">{thisWeek}</p>
          <p className="text-xs text-muted">Due in next 7 days</p>
        </div>

        <div className="card-elevated rounded-2xl border border-rose-900/40 bg-gradient-to-br from-rose-950/40 to-surface p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Overdue</span>
            <span className="grid size-8 place-items-center rounded-xl bg-rose-500/15 text-rose-400">
              <svg viewBox="0 0 20 20" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3 2 17h16L10 3ZM10 9v4M10 15h.01" />
              </svg>
            </span>
          </div>
          <p className={cx("mt-3 text-2xl font-bold tracking-tight", overdue > 0 ? "text-rose-400" : "text-ink")}>{overdue}</p>
          <p className="text-xs text-muted">Requires attention</p>
        </div>

        <div className="card-elevated rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 to-surface p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Projects</span>
            <span className="grid size-8 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <svg viewBox="0 0 20 20" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6a1 1 0 0 1 1-1h4l1.5 2H16a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6Z" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-ink">{data.length}</p>
          <p className="text-xs text-muted">Active project boards</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Assigned to you section */}
        <section aria-labelledby="mine-h" className="rounded-2xl border border-line bg-surface/90 shadow-2xs backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-accent" />
              <h2 id="mine-h" className="text-lg font-bold">Assigned to you</h2>
            </div>
            <span className="rounded-full bg-accent-wash px-2.5 py-0.5 text-xs font-semibold text-accent-strong">
              {mine.length} open
            </span>
          </div>
          {mine.length === 0 ? (
            <div className="p-5"><EmptyState title="Nothing assigned" body="Tasks assigned to you will show up here, soonest due first." /></div>
          ) : (
            <ul>
              {mine.slice(0, 12).map(({ t, project }) => {
                const due = dueLabel(t.dueDate);
                return (
                  <li key={t._id} className="border-b border-line/70 last:border-0 transition-colors hover:bg-wash/60">
                    <Link to={`/tasks/${t._id}`} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink group-hover:text-accent">{t.title}</p>
                        <p className="truncate text-xs font-medium text-muted">{project.name}</p>
                      </div>
                      <PriorityBadge priority={t.priority} />
                      <div className="w-28 text-right">
                        {due && (
                          <span
                            className={cx(
                              "inline-block rounded-md px-2 py-0.5 text-xs font-medium",
                              due.tone === "late" && "bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold",
                              due.tone === "soon" && "bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold",
                              due.tone === "normal" && "text-muted"
                            )}
                          >
                            {due.text}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Projects section */}
        <section aria-labelledby="proj-h" className="h-fit rounded-2xl border border-line bg-surface/90 shadow-2xs backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <h2 id="proj-h" className="text-lg font-bold">Projects</h2>
            </div>
            <Link to="/projects" className="text-sm font-semibold text-accent hover:text-accent-strong hover:underline">
              View all →
            </Link>
          </div>
          {data.length === 0 ? (
            <div className="p-5"><EmptyState title="No projects yet" body="Projects you own or belong to appear here." /></div>
          ) : (
            <ul>
              {data.slice(0, 6).map(({ project, tasks }) => {
                const doneCount = tasks.filter((t) => isDone(t, project)).length;
                const percent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
                return (
                  <li key={project._id} className="border-b border-line/70 last:border-0 transition-colors hover:bg-wash/60">
                    <Link to={`/projects/${project._id}`} className="block px-5 py-4">
                      <div className="mb-2 flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-ink">{project.name}</p>
                        <span className="rounded-md bg-wash px-2 py-0.5 text-xs font-medium text-muted">
                          {doneCount}/{tasks.length} ({percent}%)
                        </span>
                      </div>
                      <StageBar columns={project.columns} tasks={tasks} height={7} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
