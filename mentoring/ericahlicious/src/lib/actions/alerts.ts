"use server";

import { MOCK_ALERTS } from "@/lib/mock-data";

// In-memory store
let alerts = [...MOCK_ALERTS];

export async function getAlerts(dismissed = false) {
  return alerts
    .filter((a) => a.dismissed === dismissed)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function dismissAlert(alertId: string) {
  alerts = alerts.map((a) =>
    a.id === alertId ? { ...a, dismissed: true, dismissedAt: new Date() } : a
  );
  return alerts.find((a) => a.id === alertId) || null;
}

export async function createAlert(data: {
  type: string;
  title: string;
  description?: string;
  severity?: "info" | "warning" | "critical";
  ingredientId?: string;
  orderId?: string;
}) {
  const newAlert = {
    id: `alert-${Date.now()}`,
    type: data.type,
    title: data.title,
    description: data.description || null,
    severity: data.severity || "info",
    ingredientId: data.ingredientId || null,
    orderId: data.orderId || null,
    dismissed: false,
    dismissedAt: null,
    dismissedBy: null,
    createdAt: new Date(),
    ingredient: null,
    order: null,
  };
  alerts = [newAlert, ...alerts];
  return newAlert;
}

export async function checkAndCreateAlerts() {
  // No-op in mock mode — alerts are pre-seeded
  return;
}

export async function getAlertsSummary() {
  const active = alerts.filter((a) => !a.dismissed);
  return {
    total: active.length,
    critical: active.filter((a) => a.severity === "critical").length,
    warning: active.filter((a) => a.severity === "warning").length,
    info: active.filter((a) => a.severity === "info").length,
    byType: {
      lowStock: active.filter((a) => a.type === "LOW_STOCK").length,
      criticalStock: active.filter((a) => a.type === "CRITICAL_STOCK").length,
      expiryWarning: active.filter((a) => a.type === "EXPIRY_WARNING").length,
      expiryCritical: active.filter((a) => a.type === "EXPIRY_CRITICAL").length,
      orderOverdue: active.filter((a) => a.type === "ORDER_OVERDUE").length,
    },
  };
}
