"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrders(filters?: {
  status?: string;
  source?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  return db.order.findMany({
    where: {
      status: (filters?.status as any) || undefined,
      source: (filters?.source as any) || undefined,
      createdAt: filters?.startDate ? { gte: filters.startDate, lte: filters.endDate } : undefined,
    },
    include: {
      items: { include: { menuItem: { select: { name: true, imageUrl: true } } } },
      processedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: { include: { menuItem: true } },
      processedBy: { select: { id: true, name: true } },
    },
  });
}

export async function getKitchenOrders() {
  return db.order.findMany({
    where: { status: { in: ["PENDING", "PREPARING"] } },
    include: {
      items: { include: { menuItem: { select: { name: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDailyOrderStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [total, pending, preparing, ready, completed, cancelled, revenueResult] =
    await Promise.all([
      db.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      db.order.count({ where: { status: "PENDING",    createdAt: { gte: today, lt: tomorrow } } }),
      db.order.count({ where: { status: "PREPARING",  createdAt: { gte: today, lt: tomorrow } } }),
      db.order.count({ where: { status: "READY",      createdAt: { gte: today, lt: tomorrow } } }),
      db.order.count({ where: { status: "COMPLETED",  createdAt: { gte: today, lt: tomorrow } } }),
      db.order.count({ where: { status: "CANCELLED",  createdAt: { gte: today, lt: tomorrow } } }),
      db.order.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: today, lt: tomorrow } },
        _sum: { totalAmount: true },
      }),
    ]);

  return {
    total, pending, preparing, ready, completed, cancelled,
    totalAmount: Number(revenueResult._sum.totalAmount ?? 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────

export async function createOrder(data: {
  tableNumber?: string;
  source?: "CUSTOMER_QR" | "POS";
  qrToken?: string;
  items: Array<{ menuItemId: string; quantity: number }>;
}) {
  // Compute total from real DB prices
  const menuItems = await db.menuItem.findMany({
    where: { id: { in: data.items.map((i) => i.menuItemId) } },
  });

  const orderItems = data.items.map((item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
    const unitPrice = Number(menuItem?.promoPrice ?? menuItem?.price ?? 0);
    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });

  const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

  const order = await db.order.create({
    data: {
      tableNumber: data.tableNumber,
      source: data.source ?? "CUSTOMER_QR",
      qrToken: data.qrToken,
      totalAmount,
      status: "PENDING",
      items: { create: orderItems },
    },
    include: { items: { include: { menuItem: { select: { name: true } } } } },
  });

  revalidatePath("/orders");
  return order;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE STATUS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const order = await db.order.update({
    where: { id: orderId },
    data: {
      status,
      processedById: status === "COMPLETED" ? session.user.id : undefined,
    },
    include: { items: { include: { menuItem: { select: { name: true } } } } },
  });

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  return order;
}

export async function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, "CANCELLED");
}
