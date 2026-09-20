"use client";

import { useState } from "react";
import { MOCK_USERS } from "@/lib/mock-data";

function getRoleBadge(role: string) {
  switch (role.toUpperCase()) {
    case "OWNER": return "badge badge-owner";
    case "ADMIN": return "badge badge-admin";
    case "SUPERVISOR": return "badge badge-supervisor";
    case "CASHIER": return "badge badge-cashier";
    default: return "badge badge-completed";
  }
}

function getStatusBadge(status: string) {
  return status === "ACTIVE" ? "badge badge-active" : "badge badge-archived";
}

export default function UserManagementPage() {
  const [search, setSearch] = useState("");

  const filteredUsers = MOCK_USERS.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>User Management</h1>
        <div className="page-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary">+ Add User</button>
          <button className="btn btn-secondary">👤 Archived</button>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td>
                  <span className={getRoleBadge(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                  </span>
                </td>
                <td>
                  <span className={getStatusBadge(user.status)}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {user.lastActive ? user.lastActive.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "-"}
                </td>
                <td>
                  <div className="flex gap-4 items-center">
                    <button className="icon-btn" title="View details">👁️</button>
                    <button className="btn-danger">Archived</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-muted">
          No users found matching your search.
        </div>
      )}
    </div>
  );
}
