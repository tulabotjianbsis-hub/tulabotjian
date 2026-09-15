"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
type OrderStatus = "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
type OrderType = "DINE_IN" | "TAKE_OUT";
import { auth } from "@/auth";
import { recordInventoryAdjustment } from "./inventory";

export async function getOrders(filters?: {
  status?: OrderStatus;
  type?: OrderType;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: Prisma.OrderWhereInput = {
    ...(filters?.status && { status: filters.status }),
    ...(filters?.type && { type: filters.type }),
    ...(filters?.startDate || filters?.endDate) && {
      createdAt: {
        ...(filters?.startDate && { gte: filters.startDate }),
        ...(filters?.endDate && { lte: filters.endDate }),
      },
    },
  };

  return db.order.findMany({
    where,
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      processedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      processedBy: { select: { name: true } },
      transaction: true,
    },
  });
}

export async function createOrder(data: {
  type: OrderType;
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  tableNumber?: number;
  specialInstructions?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Calculate total amount
  let totalAmount = 0;
  const orderItems = [];

  for (const item of data.items) {
    const menuItem = await db.menuItem.findUnique({
      where: { id: item.menuItemId },
    });
    if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);

    const itemTotal = Number(menuItem.price) * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: menuItem.price,
      specialInstructions: item.specialInstructions || null,
    });
  }

  // Generate next order number
  const orderCount = await db.order.count();
  const orderNumber = orderCount + 1;

  // Create order
  const order = await db.order.create({
    data: {
      orderNumber,
      type: data.type,
      status: "PENDING",
      totalAmount,
      tableNumber: data.tableNumber || null,
      specialInstructions: data.specialInstructions || null,
      processedById: session.user.id,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  // Deduct ingredients from inventory
  for (const item of data.items) {
    const menuItem = await db.menuItem.findUnique({
      where: { id: item.menuItemId },
      include: {
        ingredients: true,
      },
    });

    if (menuItem?.ingredients) {
      for (const ing of menuItem.ingredients) {
        const deductQty = Number(ing.quantity) * item.quantity;
        await recordInventoryAdjustment({
          ingredientId: ing.ingredientId,
          type: "CONSUME",
          quantityChanged: deductQty,
          reason: `Order #${order.orderNumber}`,
        });
      }
    }
  }

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const order = await db.order.update({
    where: { id: orderId },
    data: { status },
  });

  // If order is cancelled, restore inventory
  if (status === "CANCELLED") {
    const orderDetails = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                ingredients: true,
              },
            },
          },
        },
      },
    });

    if (orderDetails?.items) {
      for (const item of orderDetails.items) {
        for (const ing of item.menuItem.ingredients) {
          const restoreQty = Number(ing.quantity) * item.quantity;
          await recordInventoryAdjustment({
            ingredientId: ing.ingredientId,
            type: "RECEIVE",
            quantityChanged: restoreQty,
            reason: `Order #${orderDetails.orderNumber} cancelled`,
          });
        }
      }
    }
  }

  return order;
}

export async function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, "CANCELLED");
}

export async function getKitchenOrders() {
  return db.order.findMany({
    where: {
      status: {
        in: ["PENDING", "PREPARING"],
      },
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDailyOrderStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const orders = await db.order.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    preparing: orders.filter((o) => o.status === "PREPARING").length,
    ready: orders.filter((o) => o.status === "READY").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    totalAmount: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
  };

  return stats;
}
