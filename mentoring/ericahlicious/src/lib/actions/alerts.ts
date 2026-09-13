"use server";

import { db } from "@/lib/db";
import { AlertType } from "@prisma/client";
import { auth } from "@/auth";

export async function getAlerts(dismissed = false) {
  return db.alert.findMany({
    where: { dismissed },
    include: {
      ingredient: true,
      order: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function dismissAlert(alertId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.alert.update({
    where: { id: alertId },
    data: {
      dismissed: true,
      dismissedAt: new Date(),
      dismissedBy: session.user.id,
    },
  });
}

export async function createAlert(data: {
  type: AlertType;
  title: string;
  description?: string;
  severity?: "info" | "warning" | "critical";
  ingredientId?: string;
  orderId?: string;
}) {
  return db.alert.create({
    data: {
      type: data.type,
      title: data.title,
      description: data.description,
      severity: data.severity || "info",
      ingredientId: data.ingredientId,
      orderId: data.orderId,
    },
  });
}

export async function checkAndCreateAlerts() {
  // Check for low/critical stock
  const ingredients = await db.ingredient.findMany();

  for (const ing of ingredients) {
    if (ing.status === "CRITICAL") {
      const existing = await db.alert.findFirst({
        where: {
          type: "CRITICAL_STOCK",
          ingredientId: ing.id,
          dismissed: false,
        },
      });

      if (!existing) {
        await createAlert({
          type: "CRITICAL_STOCK",
          title: `Critical stock: ${ing.name}`,
          description: `${ing.name} stock is at CRITICAL level (${ing.stock.toFixed(2)} ${ing.unit})`,
          severity: "critical",
          ingredientId: ing.id,
        });
      }
    } else if (ing.status === "LOW") {
      const existing = await db.alert.findFirst({
        where: {
          type: "LOW_STOCK",
          ingredientId: ing.id,
          dismissed: false,
        },
      });

      if (!existing) {
        await createAlert({
          type: "LOW_STOCK",
          title: `Low stock: ${ing.name}`,
          description: `${ing.name} stock is LOW (${ing.stock.toFixed(2)} ${ing.unit})`,
          severity: "warning",
          ingredientId: ing.id,
        });
      }
    }

    // Check for expiry
    if (ing.expiryDate) {
      const daysUntilExpiry = Math.ceil(
        (ing.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 0) {
        const existing = await db.alert.findFirst({
          where: {
            type: "EXPIRY_CRITICAL",
            ingredientId: ing.id,
            dismissed: false,
          },
        });

        if (!existing) {
          await createAlert({
            type: "EXPIRY_CRITICAL",
            title: `Expired: ${ing.name}`,
            description: `${ing.name} expired on ${ing.expiryDate.toLocaleDateString()}`,
            severity: "critical",
            ingredientId: ing.id,
          });
        }
      } else if (daysUntilExpiry <= 7) {
        const existing = await db.alert.findFirst({
          where: {
            type: "EXPIRY_WARNING",
            ingredientId: ing.id,
            dismissed: false,
          },
        });

        if (!existing) {
          await createAlert({
            type: "EXPIRY_WARNING",
            title: `Expiring soon: ${ing.name}`,
            description: `${ing.name} expires in ${daysUntilExpiry} days (${ing.expiryDate.toLocaleDateString()})`,
            severity: "warning",
            ingredientId: ing.id,
          });
        }
      }
    }
  }

  // Check for overdue orders
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const preparingOrders = await db.order.findMany({
    where: {
      status: "PREPARING",
      createdAt: {
        lt: thirtyMinutesAgo,
      },
    },
  });

  for (const order of preparingOrders) {
    const existing = await db.alert.findFirst({
      where: {
        type: "ORDER_OVERDUE",
        orderId: order.id,
        dismissed: false,
      },
    });

    if (!existing) {
      const minutesOverdue = Math.floor(
        (Date.now() - order.createdAt.getTime()) / (1000 * 60)
      );
      await createAlert({
        type: "ORDER_OVERDUE",
        title: `Order #${order.orderNumber} overdue`,
        description: `Order has been in PREPARING for ${minutesOverdue} minutes`,
        severity: "warning",
        orderId: order.id,
      });
    }
  }
}

export async function getAlertsSummary() {
  const alerts = await getAlerts(false);

  return {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
    byType: {
      lowStock: alerts.filter((a) => a.type === "LOW_STOCK").length,
      criticalStock: alerts.filter((a) => a.type === "CRITICAL_STOCK").length,
      expiryWarning: alerts.filter((a) => a.type === "EXPIRY_WARNING").length,
      expiryCritical: alerts.filter((a) => a.type === "EXPIRY_CRITICAL").length,
      orderOverdue: alerts.filter((a) => a.type === "ORDER_OVERDUE").length,
    },
  };
}
