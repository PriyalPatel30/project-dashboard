
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, ErrorNote, Field, Input, Select } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { errorMessage, ROLE_LABEL, ROLE_SUMMARY } from "@/lib/format";
import type { Role } from "@/lib/types";

const SELECTABLE_ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "admin", label: ROLE_LABEL.admin, hint: "Manage users, create/delete projects, view all projects." },
  { value: "project_manager", label: ROLE_LABEL.project_manager, hint: "Create projects, manage teams & tasks." },
  { value: "member", label: ROLE_LABEL.member, hint: "Work on tasks in projects you belong to." },
  { value: "viewer", label: ROLE_LABEL.viewer, hint: "Read-only access to projects and tasks." },
];

export default function Register() {
  const { register, status } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authed") navigate("/dashboard", { replace: true });
  }, [status, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Use at least 6 characters for your password.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't create your account."));
      setBusy(false);
    }
  }

  const selectedHint = SELECTABLE_ROLES.find((r) => r.value === role)?.hint;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted">
          The first user to register becomes the Admin automatically.
        </p>
      </div>
      {error && <ErrorNote message={error} />}
      <Field label="Full name">
        {(id) => <Input id={id} autoComplete="name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} />}
      </Field>
      <Field label="Email">
        {(id) => <Input id={id} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />}
      </Field>
      <Field label="Password" hint="At least 6 characters.">
        {(id) => <Input id={id} type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />}
      </Field>
      <Field label="Role" hint={selectedHint}>
        {(id) => (
          <Select id={id} value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {SELECTABLE_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Button type="submit" variant="primary" loading={busy} disabled={!name || !email || !password}>
        Create account
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-accent-strong underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </form>
  );
}
