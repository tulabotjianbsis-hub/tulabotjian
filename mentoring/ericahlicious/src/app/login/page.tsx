"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const ROLES = [
  { key: "SUPERVISOR", label: "Cashier", icon: "🖥️", email: "supervisor@test.com" },
  { key: "SUPERVISOR2", label: "Supervisor", icon: "👤", email: "supervisor@test.com" },
  { key: "ADMIN", label: "Admin/Management", icon: "⚙️", email: "manager@test.com" },
  { key: "OWNER", label: "Owner", icon: "🏪", email: "owner@test.com" },
];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "login">("role");
  const [selectedRole, setSelectedRole] = useState<typeof ROLES[0] | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleRoleSelect(role: typeof ROLES[0]) {
    setSelectedRole(role);
    setEmail(role.email);
    setPassword("password");
    setError("");
    setStep("login");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid username or password. Please try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo">E</div>
          <div className="login-brand-name">ERICAHLICIOUS Management System</div>
        </div>

        {step === "role" ? (
          /* ── Step 1: Role Selection ── */
          <>
            <div className="login-subtitle">Select your role</div>
            <div className="role-grid">
              {ROLES.map((role) => (
                <button
                  key={role.key + role.label}
                  className="role-btn"
                  onClick={() => handleRoleSelect(role)}
                  type="button"
                >
                  <span className="role-icon">{role.icon}</span>
                  {role.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* ── Step 2: Login Form ── */
          <>
            <button
              type="button"
              className="login-back-btn"
              onClick={() => { setStep("role"); setError(""); }}
            >
              ← Back
            </button>
            <div className="login-subtitle">{selectedRole?.label}</div>

            <form className="login-form" onSubmit={handleLogin}>
              {error && <div className="form-error">{error}</div>}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Username</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="Enter username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-login"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
