import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardStats, getTopSellingItems, getInventoryStatusCards, getRecommendations } from "@/lib/actions/analytics";
import { getOrders, getDailyOrderStats } from "@/lib/actions/orders";
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SupervisorDashboard } from "@/components/dashboard/SupervisorDashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string })?.role || "SUPERVISOR";

  // Fetch real data in parallel
  const [stats, topItems, inventoryCards, recommendations, orders, dailyStats] =
    await Promise.all([
      getDashboardStats(),
      getTopSellingItems("week"),
      getInventoryStatusCards(),
      getRecommendations(),
      getOrders(),
      getDailyOrderStats(),
    ]);

  // Map inventory status cards to component shape
  const statusCards = inventoryCards.slice(0, 6).map((ing) => ({
    name: ing.name,
    status: ing.status === "GOOD" ? "In Stock" : ing.status === "LOW" ? "Low Stock" : "Critical",
    type: (ing.status === "GOOD" ? "good" : "low") as "good" | "low" | "out",
  }));

  // Map top items for charts
  const topItemsForChart = topItems.map((i) => ({
    name: i.name,
    quantity: i.quantity,
    revenue: i.revenue,
  }));

  // Usage insights and restocking notes derived from recommendations
  const usageInsights = recommendations
    .filter((r) => r.type === "RESTOCK_LOW" || r.type === "RESTOCK_CRITICAL")
    .map((r) => r.description)
    .slice(0, 3);

  const restockingNotes = recommendations
    .filter((r) => r.type === "RESTOCK_CRITICAL")
    .map((r) => r.description)
    .slice(0, 3);

  // Serialize Decimal/Date from Prisma for client components
  const serializedOrders = orders.map((o) => ({
    ...o,
    totalAmount: Number(o.totalAmount),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.subtotal),
      menuItem: { name: i.menuItem.name },
    })),
  }));

  const props = {
    statusCards,
    topItems: topItemsForChart,
    recommendations,
    totalIngredients: stats.totalIngredients,
    lowStockCount: stats.lowStockCount,
    expiringSoonCount: 0, // could add expiry query
    mostUsed: topItemsForChart.slice(0, 4).map((i) => ({ name: i.name, usage: i.quantity })),
    stockDistribution: [
      { name: "Good", value: inventoryCards.filter((i) => i.status === "GOOD").length, color: "#22c55e" },
      { name: "Low",  value: inventoryCards.filter((i) => i.status === "LOW").length,  color: "#eab308" },
      { name: "Critical", value: inventoryCards.filter((i) => i.status === "CRITICAL").length, color: "#ef4444" },
    ],
    usageInsights,
    restockingNotes,
    orders: serializedOrders as any,
    dailyStats,
  };

  if (role === "OWNER") return <OwnerDashboard {...props} />;
  if (role === "ADMIN") return <AdminDashboard {...props} />;
  return <SupervisorDashboard {...props} />;
}
