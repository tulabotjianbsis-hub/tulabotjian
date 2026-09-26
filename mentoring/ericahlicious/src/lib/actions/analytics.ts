"use server";

import { db } from "@/lib/db";

type Period = "day" | "week" | "month" | "year";

function getPeriodRange(period: Period): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  let startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  switch (period) {
    case "day":
      break; // already today
    case "week":
      startDate.setDate(now.getDate() - 6);
      break;
    case "month":
      startDate.setDate(1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  return { startDate, endDate };
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalIngredients,
    lowStockCount,
    criticalStockCount,
    todayOrderCount,
    todayRevenue,
    recentReports,
  ] = await Promise.all([
    db.ingredient.count(),
    db.ingredient.count({ where: { status: "LOW" } }),
    db.ingredient.count({ where: { status: "CRITICAL" } }),
    db.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    db.order.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: today, lt: tomorrow } },
      _sum: { totalAmount: true },
    }),
    db.dailyReport.findMany({ orderBy: { date: "desc" }, take: 7 }),
  ]);

  return {
    totalIngredients,
    lowStockCount,
    criticalStockCount,
    todayOrderCount,
    todayRevenue: Number(todayRevenue._sum.totalAmount ?? 0),
    recentReports,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getSalesReport(period: Period = "week") {
  const { startDate, endDate } = getPeriodRange(period);

  // Aggregate revenue by day from DailyReport snapshots
  const reports = await db.dailyReport.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    orderBy: { date: "asc" },
  });

  const totalRevenue = reports.reduce((s, r) => s + Number(r.totalRevenue), 0);
  const totalExpenses = reports.reduce((s, r) => s + Number(r.totalExpenses), 0);
  const netProfit = reports.reduce((s, r) => s + Number(r.netProfit), 0);
  const totalOrders = reports.reduce((s, r) => s + r.totalOrders, 0);

  const salesByDay = reports.map((r) => ({
    date: r.date.toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
    total: Number(r.totalRevenue),
    expenses: Number(r.totalExpenses),
    orders: r.totalOrders,
  }));

  return { totalRevenue, totalExpenses, netProfit, totalOrders, salesByDay };
}

export async function getTopSellingItems(period: Period = "week") {
  const { startDate, endDate } = getPeriodRange(period);

  const topItems = await db.orderItem.groupBy({
    by: ["menuItemId"],
    where: {
      order: {
        status: "COMPLETED",
        createdAt: { gte: startDate, lte: endDate },
      },
    },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { subtotal: "desc" } },
    take: 8,
  });

  const menuItems = await db.menuItem.findMany({
    where: { id: { in: topItems.map((i) => i.menuItemId) } },
    select: { id: true, name: true },
  });

  return topItems.map((item) => ({
    menuItemId: item.menuItemId,
    name: menuItems.find((m) => m.id === item.menuItemId)?.name ?? "Unknown",
    quantity: item._sum.quantity ?? 0,
    revenue: Number(item._sum.subtotal ?? 0),
  }));
}

export async function getInventoryStatusCards() {
  const ingredients = await db.ingredient.findMany({
    select: { id: true, name: true, stock: true, unit: true, status: true },
    orderBy: { status: "asc" },
    take: 12,
  });

  return ingredients.map((ing) => ({
    id: ing.id,
    name: ing.name,
    stock: Number(ing.stock),
    unit: ing.unit,
    status: ing.status,
  }));
}

export async function getRecommendations() {
  // Smart recommendations based on real DB data
  const [criticalItems, lowItems, expiringItems] = await Promise.all([
    db.ingredient.findMany({
      where: { status: "CRITICAL" },
      select: { name: true, stock: true, unit: true, supplier: true },
      take: 3,
    }),
    db.ingredient.findMany({
      where: { status: "LOW" },
      select: { name: true, stock: true, unit: true, supplier: true },
      take: 3,
    }),
    db.ingredient.findMany({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: { name: true, expiryDate: true },
      take: 3,
    }),
  ]);

  const recommendations = [];

  for (const item of criticalItems) {
    recommendations.push({
      type: "RESTOCK_CRITICAL",
      title: `Restock ${item.name}`,
      description: `Critical: only ${Number(item.stock)}${item.unit} remaining. Contact ${item.supplier ?? "supplier"}.`,
      severity: "critical",
    });
  }

  for (const item of lowItems) {
    recommendations.push({
      type: "RESTOCK_LOW",
      title: `Low Stock: ${item.name}`,
      description: `Only ${Number(item.stock)}${item.unit} left. Consider reordering soon.`,
      severity: "warning",
    });
  }

  for (const item of expiringItems) {
    recommendations.push({
      type: "EXPIRY_WARNING",
      title: `Expiring Soon: ${item.name}`,
      description: `Expires on ${item.expiryDate?.toLocaleDateString("en-PH")}. Use or dispose of immediately.`,
      severity: "warning",
    });
  }

  return recommendations;
}
