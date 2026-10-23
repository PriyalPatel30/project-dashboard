import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, ErrorNote, Field, Input, Select, cx } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/format";

const LOGIN_ROLES: { value: string; label: string; short: string; icon: string; hint: string }[] = [
  { value: "any", label: "Auto-detect (Account Role)", short: "Auto", icon: "⚡", hint: "Signs you in directly with your account's assigned system role." },
  { value: "admin", label: "Admin", short: "Admin", icon: "🛡️", hint: "Verifies your account has Admin privileges." },
  { value: "project_manager", label: "Project Manager", short: "PM", icon: "📋", hint: "Verifies your account has Project Manager permissions." },
  { value: "member", label: "Team Member", short: "Member", icon: "👤", hint: "Verifies your account is registered as a Team Member." },
  { value: "viewer", label: "Viewer", short: "Viewer", icon: "👁️", hint: "Verifies your account has Viewer (read-only) access." },
];

export default function Login() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("any");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authed") navigate("/dashboard", { replace: true });
  }, [status, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password, remember, role);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't sign you in."));
      setBusy(false);
    }
  }

  const selectedOption = LOGIN_ROLES.find((r) => r.value === role);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Pick up where your team left off with role-based access.</p>
      </div>

      {error && <ErrorNote message={error} />}

      {/* Role selector chips */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="role-select" className="block text-xs font-semibold text-muted uppercase tracking-wider">
            Sign in as role
          </label>
          <span className="text-[11px] text-muted">Role verification active</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {LOGIN_ROLES.map((r) => {
            const active = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => {
                  setRole(r.value);
                  setError(null);
                }}
                className={cx(
                  "flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-xs font-medium transition-all",
                  active
                    ? "border-accent bg-accent-wash/60 text-accent-strong shadow-2xs font-semibold ring-2 ring-accent/30"
                    : "border-line bg-surface/60 text-muted hover:border-line-strong hover:text-ink hover:bg-wash"
                )}
              >
                <span className="text-sm mb-0.5">{r.icon}</span>
                <span className="truncate max-w-full text-[11px]">{r.short}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-xs text-muted flex items-start gap-1.5">
          <span className="text-accent shrink-0">ℹ️</span>
          <span>{selectedOption?.hint}</span>
        </p>
      </div>

      <Field label="Email">
        {(id) => (
          <Input
            id={id}
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="you@company.com"
          />
        )}
      </Field>

      <Field label="Password">
        {(id) => (
          <Input
            id={id}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
          />
        )}
      </Field>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="size-4 rounded accent-accent"
        />
        Keep me signed in on this device
      </label>

      <Button type="submit" variant="primary" loading={busy} disabled={!email || !password}>
        Sign in
      </Button>

      <p className="text-center text-sm text-muted">
        New to Pulse?{" "}
        <Link to="/register" className="font-medium text-accent-strong underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </form>
  );
}
