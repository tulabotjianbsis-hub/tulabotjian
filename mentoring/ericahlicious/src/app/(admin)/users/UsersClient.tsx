"use client";

import { useState } from "react";
import { archiveUser, restoreUser } from "@/lib/actions/users";
import { useRouter } from "next/navigation";

type User = {
  id: string; name: string; email: string; role: string;
  status: string; lastActive: string | null; createdAt: string;
};

function getRoleBadge(role: string) {
  switch (role) {
    case "OWNER":      return "badge badge-owner";
    case "ADMIN":      return "badge badge-admin";
    case "SUPERVISOR": return "badge badge-supervisor";
    default:           return "badge badge-completed";
  }
}

export default function UsersClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleArchive(id: string) {
    setLoading(id + "_archive");
    await archiveUser(id);
    setLoading(null);
    router.refresh();
  }

  async function handleRestore(id: string) {
    setLoading(id + "_restore");
    await restoreUser(id);
    setLoading(null);
    router.refresh();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>User Management</h1>
        <div className="page-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" className="search-input" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary">+ Add User</button>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Active</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td style={{ color: "var(--text-muted)" }}>{user.email}</td>
                <td><span className={getRoleBadge(user.role)}>{user.role}</span></td>
                <td>
                  <span className={user.status === "ACTIVE" ? "badge badge-active" : "badge badge-archived"}>
                    {user.status}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {user.lastActive ? new Date(user.lastActive).toLocaleDateString("en-US") : "-"}
                </td>
                <td>
                  {user.status === "ACTIVE" ? (
                    <button
                      className="btn-danger"
                      disabled={loading === user.id + "_archive"}
                      onClick={() => handleArchive(user.id)}
                    >
                      {loading === user.id + "_archive" ? "..." : "Archive"}
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      disabled={loading === user.id + "_restore"}
                      onClick={() => handleRestore(user.id)}
                    >
                      {loading === user.id + "_restore" ? "..." : "Restore"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-muted">No users found.</div>}
    </div>
  );
}
