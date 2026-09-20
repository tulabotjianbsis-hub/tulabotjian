"use server";

import {
  MOCK_ORDERS,
  MOCK_MENU_ITEMS,
  MOCK_DAILY_ORDER_STATS,
  type MockOrder,
} from "@/lib/mock-data";

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
type OrderType = "DINE_IN" | "TAKE_OUT";

// In-memory mutable store for demo purposes
let orders: MockOrder[] = [...MOCK_ORDERS];
let nextOrderNumber = 1006;

export async function getOrders(filters?: {
  status?: OrderStatus;
  type?: OrderType;
  startDate?: Date;
  endDate?: Date;
}) {
  let result = [...orders];
  if (filters?.status) result = result.filter((o) => o.status === filters.status);
  if (filters?.type) result = result.filter((o) => o.type === filters.type);
  return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getOrderById(id: string) {
  return orders.find((o) => o.id === id) || null;
}

export async function createOrder(data: {
  type: OrderType;
  items: Array<{ menuItemId: string; quantity: number; specialInstructions?: string }>;
  tableNumber?: number;
  specialInstructions?: string;
}) {
  let totalAmount = 0;
  const items = data.items.map((item) => {
    const menuItem = MOCK_MENU_ITEMS.find((m) => m.id === item.menuItemId);
    const unitPrice = menuItem?.price || 0;
    totalAmount += unitPrice * item.quantity;
    return {
      id: `oi-${Date.now()}-${item.menuItemId}`,
      orderId: "",
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice,
      variation: null,
      specialInstructions: item.specialInstructions || null,
      menuItem: { name: menuItem?.name || "Unknown" },
    };
  });

  const newOrder = {
    id: `order-${Date.now()}`,
    orderNumber: nextOrderNumber++,
    type: data.type,
    status: "PENDING" as const,
    totalAmount,
    tableNumber: data.tableNumber || null,
    specialInstructions: data.specialInstructions || null,
    qrToken: null,
    processedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    processedBy: null,
    items: items.map((i) => ({ ...i, orderId: `order-${Date.now()}` })),
    transaction: null,
    alerts: [],
  };

  orders = [newOrder, ...orders];
  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  orders = orders.map((o) =>
    o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
  );
  return orders.find((o) => o.id === orderId) || null;
}

export async function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, "CANCELLED");
}

export async function getKitchenOrders() {
  return orders
    .filter((o) => o.status === "PENDING" || o.status === "PREPARING")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function getDailyOrderStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => o.createdAt >= today);
  if (todayOrders.length > 0) {
    return {
      total: todayOrders.length,
      pending: todayOrders.filter((o) => o.status === "PENDING").length,
      preparing: todayOrders.filter((o) => o.status === "PREPARING").length,
      ready: todayOrders.filter((o) => o.status === "READY").length,
      completed: todayOrders.filter((o) => o.status === "COMPLETED").length,
      cancelled: todayOrders.filter((o) => o.status === "CANCELLED").length,
      totalAmount: todayOrders
        .filter((o) => o.status === "COMPLETED")
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };
  }
  // Fallback to static mock when no orders today
  return MOCK_DAILY_ORDER_STATS;
}
