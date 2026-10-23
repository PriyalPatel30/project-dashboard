import { Link } from "react-router-dom";
import { dueLabel } from "@/lib/format";
import type { Priority, Task } from "@/lib/types";
import { AvatarStack, PriorityBadge, TypeBadge, cx } from "./ui";

const PRIORITY_STRIP: Record<Priority, string> = {
  critical: "border-l-rose-500",
  high: "border-l-amber-500",
  medium: "border-l-blue-500",
  low: "border-l-slate-300",
};

export function TaskCard({
  task,
  done,
  dragging,
  readOnly,
  ...drag
}: {
  task: Task;
  done: boolean;
  dragging?: boolean;
  readOnly?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  const due = dueLabel(task.dueDate);
  const subDone = task.subtasks.filter((s) => s.done).length;

  return (
    <article
      {...drag}
      draggable={!readOnly}
      className={cx(
        "group rounded-xl border border-line bg-surface p-3.5 shadow-2xs transition-all duration-150 border-l-[3.5px]",
        PRIORITY_STRIP[task.priority] ?? "border-l-slate-300",
        !readOnly && "cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300",
        dragging && "opacity-40 scale-95"
      )}
    >
      <Link
        to={`/tasks/${task._id}`}
        draggable={false}
        className={cx(
          "block text-[14.5px] leading-snug font-semibold transition-colors group-hover:text-accent",
          done && "text-muted line-through"
        )}
      >
        {task.title}
      </Link>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        <TypeBadge type={task.type} />
      </div>

      {task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <span
              key={l}
              className="rounded-md bg-accent-wash/60 px-1.5 py-0.5 text-[11px] font-medium text-accent-strong border border-accent/15"
            >
              #{l}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted pt-1 border-t border-line/50">
        <span className="flex items-center gap-2">
          {due && !done && (
            <span
              className={cx(
                "rounded px-1.5 py-0.5 text-[11px] font-medium",
                due.tone === "late" && "bg-rose-50 text-rose-700 border border-rose-200 font-semibold",
                due.tone === "soon" && "bg-amber-50 text-amber-800 border border-amber-200 font-semibold",
                due.tone === "normal" && "text-muted"
              )}
            >
              {due.text}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <svg viewBox="0 0 16 16" className="size-3 text-faint" fill="currentColor">
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11ZM6 5.5a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6A.75.75 0 0 1 6 5.5Zm0 3a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6A.75.75 0 0 1 6 8.5Zm0 3a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6A.75.75 0 0 1 6 11.5ZM3.25 5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm0 3a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm0 3a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
              </svg>
              {subDone}/{task.subtasks.length}
            </span>
          )}
        </span>
        {task.assignees.length > 0 && <AvatarStack people={task.assignees} max={3} size={22} />}
      </div>
    </article>
  );
}
