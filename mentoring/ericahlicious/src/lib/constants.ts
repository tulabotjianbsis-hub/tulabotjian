import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  SUPERVISOR: "Supervisor",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER: "Full system access including reports and user management",
  ADMIN: "Manage users, menu, and orders",
  SUPERVISOR: "Monitor inventory, menu, and transactions",
};

export const ROLE_ICONS: Record<Role, string> = {
  OWNER: "👑",
  ADMIN: "🛡️",
  SUPERVISOR: "📋",
};
