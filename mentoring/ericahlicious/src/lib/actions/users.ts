"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

export async function getUsers(filters?: { search?: string; status?: string }) {
  return db.user.findMany({
    where: {
      status: (filters?.status as any) || undefined,
      name: filters?.search ? { contains: filters.search } : undefined,
    },
    select: {
      id: true, name: true, email: true, role: true,
      status: true, lastActive: true, createdAt: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true,
      status: true, lastActive: true, createdAt: true,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "OWNER" | "ADMIN" | "SUPERVISOR";
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(data.password, 12);

  const user = await db.user.create({
    data: { name: data.name, email: data.email, password: hashed, role: data.role, status: "ACTIVE" },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  revalidatePath("/users");
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────────────────────

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: "OWNER" | "ADMIN" | "SUPERVISOR" }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, status: true, updatedAt: true },
  });

  revalidatePath("/users");
  return user;
}

export async function archiveUser(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.user.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidatePath("/users");
}

export async function restoreUser(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.user.update({ where: { id }, data: { status: "ACTIVE" } });
  revalidatePath("/users");
}

export async function changeUserPassword(id: string, newPassword: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(newPassword, 12);

  await db.user.update({ where: { id }, data: { password: hashed } });
  revalidatePath("/users");
}
