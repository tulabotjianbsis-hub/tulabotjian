import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  MOCK_INGREDIENTS,
  MOCK_ANALYTICS,
  MOCK_RECOMMENDATIONS,
  MOCK_ORDERS,
  MOCK_DAILY_ORDER_STATS,
} from "@/lib/mock-data";
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SupervisorDashboard } from "@/components/dashboard/SupervisorDashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string })?.role || "SUPERVISOR";

  // Compute inventory status summary
  const lowStock = MOCK_INGREDIENTS.filter((i) => i.status === "LOW" || i.status === "CRITICAL");
  const goodStock = MOCK_INGREDIENTS.filter((i) => i.status === "GOOD");
  const expiringSoon = MOCK_INGREDIENTS.filter((i) => {
    if (!i.expiryDate) return false;
    const days = Math.ceil((i.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 7;
  });

  // Representative inventory status cards (pick 3)
  const statusCards = [
    lowStock[0] ? { name: lowStock[0].name, status: "Low Stock", type: "low" as const } : null,
    goodStock[0] ? { name: goodStock[0].name, status: "In Stock", type: "good" as const } : null,
    lowStock.find((i) => i.status === "CRITICAL" && i.stock === 0)
      ? { name: lowStock.find((i) => i.status === "CRITICAL" && i.stock === 0)!.name, status: "Out Of Stock", type: "out" as const }
      : goodStock[1]
      ? { name: goodStock[1].name, status: "In Stock", type: "good" as const }
      : null,
  ].filter(Boolean) as { name: string; status: string; type: "low" | "good" | "out" }[];

  const props = {
    statusCards,
    topItems: MOCK_ANALYTICS.topItems,
    recommendations: MOCK_RECOMMENDATIONS,
    totalIngredients: MOCK_INGREDIENTS.length,
    lowStockCount: lowStock.length,
    expiringSoonCount: expiringSoon.length,
    mostUsed: MOCK_INGREDIENTS.slice(0, 4).map((i) => ({ name: i.name, usage: Math.floor(Math.random() * 8) + 3 })),
    stockDistribution: [
      { name: "Good", value: goodStock.length, color: "#22c55e" },
      { name: "Low", value: lowStock.length, color: "#eab308" },
    ],
    usageInsights: [
      "Fresh Milk usage increased by 35% this week compared to last week.",
      "Coffee beans consumption rose by 20% during peak hours (8 AM – 11 AM).",
      "Sugar usage decreased by 15%, indicating lower demand for sweet beverages.",
    ],
    restockingNotes: [
      "Restock coffee beans (2kg) within the next 2 days to prevent stockout.",
      "Order at least 10 liters of milk today to meet projected demand for the next 3 days.",
      "Increase sugar stock by +20% due to rising usage trend this week.",
    ],
    orders: MOCK_ORDERS,
    dailyStats: MOCK_DAILY_ORDER_STATS,
  };

  if (role === "OWNER") return <OwnerDashboard {...props} />;
  if (role === "ADMIN") return <AdminDashboard {...props} />;
  return <SupervisorDashboard {...props} />;
}
