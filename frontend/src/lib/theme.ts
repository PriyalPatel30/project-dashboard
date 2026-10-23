import { useEffect, useState } from "react";

export type ThemeName = "indigo" | "violet" | "cyan" | "emerald" | "amber" | "rose";

export interface ThemeOption {
  id: ThemeName;
  label: string;
  color: string;
  gradient: string;
}

export const THEMES: ThemeOption[] = [
  { id: "indigo", label: "Indigo", color: "#6366f1", gradient: "from-indigo-500 to-purple-600" },
  { id: "violet", label: "Violet", color: "#7c3aed", gradient: "from-violet-500 to-fuchsia-600" },
  { id: "cyan", label: "Ocean", color: "#0284c7", gradient: "from-sky-500 to-cyan-600" },
  { id: "emerald", label: "Emerald", color: "#059669", gradient: "from-emerald-500 to-teal-600" },
  { id: "amber", label: "Sunset", color: "#ea580c", gradient: "from-amber-500 to-orange-600" },
  { id: "rose", label: "Berry", color: "#e11d48", gradient: "from-rose-500 to-pink-600" },
];

const STORAGE_KEY = "pulse_theme";

export function getStoredTheme(): ThemeName {
  if (typeof window === "undefined") return "indigo";
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  if (stored && THEMES.some((t) => t.id === stored)) return stored;
  return "indigo";
}

export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    applyTheme(t);
  };

  return { theme, setTheme, themes: THEMES };
}
