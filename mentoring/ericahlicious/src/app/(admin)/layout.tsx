import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import Link from "next/link";

// Role-based navigation
const NAV_BY_ROLE: Record<string, { href: string; label: string; icon: string }[]> = {
  OWNER: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/orders", label: "Order", icon: "📝" },
    { href: "/users", label: "Users", icon: "👤" },
    { href: "/menu", label: "Menu", icon: "☰" },
    { href: "/ingredients", label: "Inventory", icon: "📦" },
    { href: "/reports", label: "Reports", icon: "📈" },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/users", label: "Users", icon: "👤" },
    { href: "/menu", label: "Menu", icon: "☰" },
    { href: "/reports", label: "Reports", icon: "📈" },
  ],
  SUPERVISOR: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/orders", label: "Order", icon: "📝" },
    { href: "/menu", label: "Menu", icon: "☰" },
    { href: "/ingredients", label: "Inventory", icon: "📦" },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  SUPERVISOR: "Supervisor",
};

const DASHBOARD_TITLE: Record<string, string> = {
  OWNER: "Owner Dashboard",
  ADMIN: "Admin Dashboard",
  SUPERVISOR: "Supervisor Dashboard",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string })?.role || "SUPERVISOR";
  const userName = session.user.name || "User";
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.SUPERVISOR;
  const roleLabel = ROLE_LABELS[role] || role;
  const dashTitle = DASHBOARD_TITLE[role] || "Dashboard";

  return (
    <div className="admin-layout">
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className="sidebar">
        {/* User info */}
        <div className="sidebar-header">
          <div className="sidebar-logo">E</div>
          <div>
            <div className="sidebar-user-name truncate" style={{ maxWidth: 130 }}>{userName}</div>
            <div className="sidebar-user-role">{roleLabel}</div>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-section-label">Management</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-link">
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Main area ────────────────────────────────── */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title">
            <span style={{ fontSize: 18 }}>▦</span>
            {dashTitle}
          </div>
          <form
            action={async () => {
              "use server";
              await logout();
            }}
          >
            <button type="submit" className="topbar-logout">
              <span style={{ fontSize: 15 }}>↪</span>
              Log Out
            </button>
          </form>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
