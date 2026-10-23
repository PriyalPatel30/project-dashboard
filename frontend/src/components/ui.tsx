
import { Link } from "react-router-dom";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { PRIORITY_COLOR, ROLE_LABEL, initials, sortedColumns, stageColor } from "@/lib/format";
import type { Column, Person, Priority, Role, Task, TaskType } from "@/lib/types";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

/* ---------- Buttons ---------- */

type Variant = "primary" | "secondary" | "ghost" | "danger";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-xs hover:bg-accent-strong hover:shadow-md hover:shadow-accent/25 active:scale-[0.98] transition-all disabled:opacity-50",
  secondary: "bg-surface text-ink border border-line hover:bg-wash hover:border-slate-300 shadow-xs transition-all disabled:text-faint",
  ghost: "text-muted hover:bg-wash hover:text-ink transition-colors disabled:text-faint",
  danger: "bg-danger text-white shadow-xs hover:bg-rose-600 hover:shadow-md hover:shadow-rose-500/25 active:scale-[0.98] transition-all disabled:opacity-50",
};

export function buttonClass(variant: Variant = "secondary", size: "sm" | "md" = "md", extra?: string) {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-[9px] font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed",
    size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
    VARIANTS[variant],
    extra
  );
}

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md";
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      className={buttonClass(variant, size, className)}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "secondary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link to={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

/* ---------- Form fields ---------- */

const fieldBase =
  "rounded-[9px] border border-line bg-surface px-3 text-sm text-ink placeholder:text-faint transition-colors hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-wash disabled:text-faint";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

const width = (c?: string) => (c && /(^|\s)w-/.test(c) ? "" : "w-full");

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cx(fieldBase, width(className), "h-10", className)} />;
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cx(fieldBase, width(className), "min-h-24 py-2.5 leading-relaxed", className)} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={cx(fieldBase, width(className), "h-10 pr-8", className)}>
      {children}
    </select>
  );
}

/* ---------- Feedback ---------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx("animate-spin", className ?? "size-5")} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-24 text-muted">
      <Spinner />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-danger/25 bg-danger-wash px-4 py-3 text-sm text-danger">
      <span>{message}</span>
      {onRetry && (
        <Button size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/* ---------- Toasts ---------- */

interface Toast {
  id: number;
  text: string;
  tone: "ok" | "error";
}
const ToastContext = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "pop-in pointer-events-auto max-w-md rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg",
              t.tone === "ok" ? "bg-ink text-white" : "bg-danger text-white"
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          "pop-in relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl",
          width
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-lg text-muted hover:bg-wash hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md">
      <p className="text-sm text-muted">{body}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          loading={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
            } finally {
              setBusy(false);
            }
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/* ---------- People ---------- */

const AVATAR_TONES = [
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#e0f2fe", text: "#0369a1" },
  { bg: "#fce7f3", text: "#be185d" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#ffedd5", text: "#c2410c" },
  { bg: "#fef9c3", text: "#a16207" },
  { bg: "#ccfbf1", text: "#0f766e" },
  { bg: "#fae8ff", text: "#86198f" },
];

export function Avatar({ person, size = 28 }: { person: Pick<Person, "_id" | "name">; size?: number }) {
  const i = useMemo(() => [...person.name].reduce((h, c) => h + c.charCodeAt(0), 0) % AVATAR_TONES.length, [person.name]);
  const tone = AVATAR_TONES[i];
  return (
    <span
      title={person.name}
      className="inline-grid shrink-0 place-items-center rounded-full font-semibold ring-2 ring-surface shadow-xs"
      style={{
        width: size,
        height: size,
        background: tone.bg,
        color: tone.text,
        fontSize: Math.max(10, size * 0.38),
      }}
    >
      {initials(person.name)}
    </span>
  );
}

export function AvatarStack({ people, max = 4, size = 26 }: { people: Person[]; max?: number; size?: number }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="inline-flex items-center -space-x-1.5">
      {shown.map((p) => (
        <Avatar key={p._id} person={p} size={size} />
      ))}
      {extra > 0 && (
        <span
          className="inline-grid place-items-center rounded-full bg-wash text-[11px] font-semibold text-muted ring-2 ring-surface"
          style={{ width: size, height: size }}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}

/* ---------- Badges ---------- */

const PRIORITY_STYLES: Record<Priority, { bg: string; text: string; dot: string; border: string }> = {
  low: { bg: "bg-slate-800/60", text: "text-slate-300", dot: "bg-slate-400", border: "border-slate-700/60" },
  medium: { bg: "bg-blue-950/60", text: "text-blue-300", dot: "bg-blue-400", border: "border-blue-800/60" },
  high: { bg: "bg-amber-950/60", text: "text-amber-300", dot: "bg-amber-400", border: "border-amber-800/60" },
  critical: { bg: "bg-rose-950/60", text: "text-rose-300", dot: "bg-rose-400", border: "border-rose-800/60" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.low;
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize", s.bg, s.text, s.border)}>
      <span className={cx("size-1.5 rounded-full", s.dot)} aria-hidden />
      {priority}
    </span>
  );
}

const TYPE_TONE: Record<TaskType, string> = {
  bug: "bg-rose-950/60 text-rose-300 border border-rose-800/60 font-semibold",
  feature: "bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-semibold",
  improvement: "bg-purple-950/60 text-purple-300 border border-purple-800/60 font-semibold",
  task: "bg-sky-950/60 text-sky-300 border border-sky-800/60 font-semibold",
};
export function TypeBadge({ type }: { type: TaskType }) {
  return <span className={cx("rounded-md px-2 py-0.5 text-xs capitalize", TYPE_TONE[type])}>{type}</span>;
}

export function RoleBadge({ role }: { role: Role }) {
  const tones: Record<Role, string> = {
    admin: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs font-semibold",
    project_manager: "bg-accent-wash text-accent-strong border border-accent/30 font-semibold",
    member: "bg-sky-950/70 text-sky-300 border border-sky-800/60 font-medium",
    viewer: "bg-slate-800/70 text-slate-300 border border-slate-700/60 font-medium",
  };
  return <span className={cx("rounded-full px-2.5 py-0.5 text-xs", tones[role] ?? tones.member)}>{ROLE_LABEL[role]}</span>;
}

export function ReadOnlyNote({ children }: { children?: React.ReactNode }) {
  return (
    <p role="note" className="mb-4 rounded-xl bg-amber-950/40 border border-amber-800/50 px-4 py-2.5 text-sm text-amber-300">
      {children ?? "You have view-only access. You can read projects and tasks but not change them."}
    </p>
  );
}

export function StageDot({ index, total }: { index: number; total: number }) {
  return <span className="size-2.5 rounded-full" style={{ background: stageColor(index, total) }} aria-hidden />;
}

/* ---------- Stage bar: how a project's tasks are spread across its stages ---------- */

export function StageBar({
  columns,
  tasks,
  height = 8,
  legend = false,
}: {
  columns: Column[];
  tasks: Pick<Task, "columnId">[];
  height?: number;
  legend?: boolean;
}) {
  const cols = sortedColumns({ columns });
  const counts = cols.map((c) => tasks.filter((t) => t.columnId === c.id).length);
  const total = counts.reduce((a, b) => a + b, 0);
  const summary = cols.map((c, i) => `${c.name}: ${counts[i]}`).join(", ");
  return (
    <div>
      <div
        role="img"
        aria-label={total ? `Tasks by stage. ${summary}` : "No tasks yet"}
        title={total ? summary : "No tasks yet"}
        className={cx("flex w-full gap-0.5 overflow-hidden rounded-full", total === 0 && "bg-wash")}
        style={{ height }}
      >
        {total > 0 &&
          cols.map((c, i) =>
            counts[i] ? (
              <span key={c.id} style={{ flexGrow: counts[i], background: stageColor(i, cols.length) }} />
            ) : null
          )}
      </div>
      {legend && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {cols.map((c, i) => (
            <li key={c.id} className="inline-flex items-center gap-1.5">
              <StageDot index={i} total={cols.length} />
              {c.name} <span className="font-medium text-ink">{counts[i]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Page header ---------- */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] leading-tight font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0 drop-shadow-xs">
      <defs>
        <linearGradient id="pulse-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-accent, #6366f1)" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="pulse-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="var(--color-accent, #6366f1)" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="16" rx="13" ry="6.5" transform="rotate(-28 16 16)" stroke="url(#pulse-grad-1)" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="4.6" fill="url(#pulse-grad-1)" />
      <circle cx="26.2" cy="10.2" r="2.8" fill="url(#pulse-grad-2)" />
    </svg>
  );
}
