import { getUsers } from "@/lib/actions/users";
import UsersClient from "./UsersClient";

export default async function UserManagementPage() {
  const users = await getUsers();
  const serialized = users.map((u) => ({
    ...u,
    lastActive: u.lastActive?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  }));
  return <UsersClient users={serialized} />;
}
