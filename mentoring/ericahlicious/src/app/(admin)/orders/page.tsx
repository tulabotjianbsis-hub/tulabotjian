import { getOrders, getDailyOrderStats } from "@/lib/actions/orders";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage() {
  const [orders, dailyStats] = await Promise.all([getOrders(), getDailyOrderStats()]);

  // Serialize Prisma Decimals for client components
  const serializedOrders = orders.map((o) => ({
    ...o,
    totalAmount: Number(o.totalAmount),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.subtotal),
    })),
  }));

  return <OrdersClient orders={serializedOrders} dailyStats={dailyStats} />;
}
