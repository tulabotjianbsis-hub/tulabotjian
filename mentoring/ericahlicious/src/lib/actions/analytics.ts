"use server";

import {
  MOCK_ANALYTICS,
  MOCK_RECOMMENDATIONS,
  MOCK_INVENTORY_LOGS,
} from "@/lib/mock-data";

export async function getSalesReport(_startDate: Date, _endDate: Date) {
  return {
    totalOrders: MOCK_ANALYTICS.salesByDay.reduce((sum, d) => sum + d.orders, 0),
    totalRevenue: MOCK_ANALYTICS.salesByDay.reduce((sum, d) => sum + d.total, 0),
    items: MOCK_ANALYTICS.topItems.map((i) => ({ ...i, count: i.quantity })),
  };
}

export async function getInventoryReport(_startDate: Date, _endDate: Date) {
  return [
    { name: "Espresso Beans", category: "Coffee", totalReceived: 5, totalConsumed: 3.5, totalWaste: 0.2, wastePercent: 5.4 },
    { name: "Whole Milk", category: "Dairy", totalReceived: 20, totalConsumed: 14, totalWaste: 1.5, wastePercent: 9.7 },
    { name: "Caramel Syrup", category: "Syrup", totalReceived: 1, totalConsumed: 0.8, totalWaste: 0, wastePercent: 0 },
    { name: "Oat Milk", category: "Dairy", totalReceived: 5, totalConsumed: 4.2, totalWaste: 0.3, wastePercent: 6.7 },
  ];
}

export async function getProfitabilityReport(_startDate: Date, _endDate: Date) {
  return MOCK_ANALYTICS.profitByCategory;
}

export async function getRecommendations() {
  return MOCK_RECOMMENDATIONS;
}

export async function getInventoryLogs(ingredientId?: string) {
  if (ingredientId) {
    return MOCK_INVENTORY_LOGS.filter((l) => l.ingredientId === ingredientId);
  }
  return MOCK_INVENTORY_LOGS;
}
