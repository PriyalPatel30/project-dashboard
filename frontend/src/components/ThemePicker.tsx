import { useState, useRef, useEffect } from "react";
import { THEMES, ThemeName, useTheme } from "@/lib/theme";
import { cx } from "./ui";

export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (compact) {
    return (
      <div className="relative inline-block" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          title="Change theme color"
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-muted hover:border-slate-300 hover:text-ink transition-colors shadow-2xs"
        >
          <span
            className="size-2.5 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: THEMES.find((t) => t.id === theme)?.color ?? "#6366f1" }}
          />
          <span>Theme</span>
        </button>

        {open && (
          <div className="pop-in absolute right-0 bottom-full mb-2 z-50 w-44 rounded-xl border border-line bg-surface p-2 shadow-xl">
            <p className="px-2 py-1 text-[11px] font-semibold tracking-wider text-faint uppercase">Color Theme</p>
            <div className="grid grid-cols-3 gap-1.5 p-1">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={cx(
                    "flex flex-col items-center gap-1 rounded-lg p-1.5 text-[11px] font-medium transition-colors hover:bg-wash",
                    theme === t.id && "bg-accent-wash text-accent-strong ring-1 ring-accent/30 font-semibold"
                  )}
                >
                  <span
                    className="size-4 rounded-full shadow-xs"
                    style={{ backgroundColor: t.color }}
                  />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface/80 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">Theme Palette</span>
        <span className="text-[11px] font-medium text-accent capitalize">{theme}</span>
      </div>
      <div className="flex items-center justify-between gap-1">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            title={`${t.label} theme`}
            onClick={() => setTheme(t.id as ThemeName)}
            className={cx(
              "relative grid size-6 place-items-center rounded-full transition-transform hover:scale-110",
              theme === t.id ? "ring-2 ring-accent ring-offset-2 scale-110" : "opacity-80 hover:opacity-100"
            )}
            style={{ backgroundColor: t.color }}
          >
            {theme === t.id && (
              <span className="size-1.5 rounded-full bg-white shadow-xs" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
