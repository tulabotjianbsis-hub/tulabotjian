"use server";

import { db } from "@/lib/db";

export async function getSalesReport(
  startDate: Date,
  endDate: Date
) {
  const orders = await db.order.findMany({
    where: {
      status: "COMPLETED",
      createdAt: {
        gte: startDate,
        lte: endDate,
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

  const itemSales = new Map<string, {
    name: string;
    quantity: number;
    revenue: number;
    count: number;
  }>();

  let totalRevenue = 0;

  for (const order of orders) {
    totalRevenue += Number(order.totalAmount);
    for (const item of order.items) {
      const key = item.menuItem.id;
      const existing = itemSales.get(key) || {
        name: item.menuItem.name,
        quantity: 0,
        revenue: 0,
        count: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.unitPrice) * item.quantity;
      existing.count += 1;
      itemSales.set(key, existing);
    }
  }

  return {
    totalOrders: orders.length,
    totalRevenue,
    items: Array.from(itemSales.values()).sort(
      (a, b) => b.revenue - a.revenue
    ),
  };
}

export async function getInventoryReport(
  startDate: Date,
  endDate: Date
) {
  const logs = await db.inventoryLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      ingredient: true,
    },
  });

  const ingredientUsage = new Map<string, {
    name: string;
    category: string;
    totalReceived: number;
    totalConsumed: number;
    totalWaste: number;
    wastePercent: number;
  }>();

  for (const log of logs) {
    const key = log.ingredient.id;
    const existing = ingredientUsage.get(key) || {
      name: log.ingredient.name,
      category: log.ingredient.category,
      totalReceived: 0,
      totalConsumed: 0,
      totalWaste: 0,
      wastePercent: 0,
    };

    if (log.type === "RECEIVE") {
      existing.totalReceived += Number(log.quantityChanged);
    } else if (log.type === "CONSUME") {
      existing.totalConsumed += Number(log.quantityChanged);
    } else if (log.type === "WASTE") {
      existing.totalWaste += Number(log.quantityChanged);
    }

    const totalUsed = existing.totalConsumed + existing.totalWaste;
    existing.wastePercent =
      totalUsed > 0 ? (existing.totalWaste / totalUsed) * 100 : 0;

    ingredientUsage.set(key, existing);
  }

  return Array.from(ingredientUsage.values())
    .filter((i) => i.totalConsumed > 0 || i.totalWaste > 0)
    .sort((a, b) => b.wastePercent - a.wastePercent);
}

export async function getProfitabilityReport(
  startDate: Date,
  endDate: Date
) {
  const orders = await db.order.findMany({
    where: {
      status: "COMPLETED",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              ingredients: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const categoryProfits = new Map<string, {
    category: string;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    count: number;
  }>();

  for (const order of orders) {
    for (const item of order.items) {
      const category = item.menuItem.category;
      const revenue = Number(item.unitPrice) * item.quantity;

      // Estimate cost: $10/kg, $8/L, $0.5 per piece
      let cost = 0;
      for (const ing of item.menuItem.ingredients) {
        let costPerUnit = 10;
        if (ing.unit === "L" || ing.unit === "ml") costPerUnit = 8;
        if (ing.unit === "pieces" || ing.unit === "dozen")
          costPerUnit = 0.5;
        cost += Number(ing.quantity) * costPerUnit * item.quantity;
      }

      const existing = categoryProfits.get(category) || {
        category,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        count: 0,
      };

      existing.totalRevenue += revenue;
      existing.totalCost += cost;
      existing.totalProfit += revenue - cost;
      existing.count += 1;

      categoryProfits.set(category, existing);
    }
  }

  return Array.from(categoryProfits.values()).sort(
    (a, b) => b.totalProfit - a.totalProfit
  );
}

export async function getRecommendations() {
  const recommendations = [];

  // 1. Reorder recommendations based on consumption
  const ingredients = await db.ingredient.findMany({
    include: {
      logs: {
        where: {
          type: "CONSUME",
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      },
    },
  });

  for (const ing of ingredients) {
    const lastMonthConsumption = ing.logs.reduce(
      (sum, log) => sum + Number(log.quantityChanged),
      0
    );
    const dailyAverage = lastMonthConsumption / 30;
    const leadTimeBuffer = dailyAverage * 3 * 1.2; // 3 days lead time + 20% safety buffer

    if (ing.stock < leadTimeBuffer && lastMonthConsumption > 0) {
      const recommendedQty = dailyAverage * 14; // 2 weeks supply

      recommendations.push({
        type: "REORDER",
        severity: ing.stock < leadTimeBuffer / 2 ? "critical" : "warning",
        title: `Reorder ${ing.name}`,
        description: `Current stock: ${ing.stock.toFixed(2)} ${ing.unit}. Based on 30-day consumption, recommend ordering ${recommendedQty.toFixed(2)} ${ing.unit}.`,
        data: { ingredientId: ing.id, recommendedQty, name: ing.name },
      });
    }

    // High waste
    const wasteLog = await db.inventoryLog.findMany({
      where: {
        ingredientId: ing.id,
        type: "WASTE",
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const totalWaste = wasteLog.reduce(
      (sum, log) => sum + Number(log.quantityChanged),
      0
    );
    const wastePercent =
      lastMonthConsumption > 0
        ? (totalWaste / (lastMonthConsumption + totalWaste)) * 100
        : 0;

    if (wastePercent > 5) {
      recommendations.push({
        type: "WASTE_ALERT",
        severity: wastePercent > 10 ? "critical" : "warning",
        title: `High waste: ${ing.name}`,
        description: `${wastePercent.toFixed(1)}% waste rate in last 30 days. Consider checking expiry management or supplier quality.`,
        data: { ingredientId: ing.id, wastePercent, name: ing.name },
      });
    }
  }

  // 2. Menu optimization
  const sales = await db.order.findMany({
    where: {
      status: "COMPLETED",
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
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

  const itemSales = new Map<string, number>();
  for (const order of sales) {
    for (const item of order.items) {
      itemSales.set(
        item.menuItem.id,
        (itemSales.get(item.menuItem.id) || 0) + item.quantity
      );
    }
  }

  // Low performers
  const allMenuItems = await db.menuItem.findMany({
    where: { isArchived: false },
    include: {
      ingredients: true,
    },
  });

  for (const item of allMenuItems) {
    const sales = itemSales.get(item.id) || 0;
    if (sales < 3) {
      // Less than 3 sold in 30 days
      recommendations.push({
        type: "MENU_OPTIMIZATION",
        severity: "warning",
        title: `Consider discontinuing: ${item.name}`,
        description: `Only ${sales} sold in last 30 days. Consider removing or promoting via combo pricing.`,
        data: { menuItemId: item.id, name: item.name, sales },
      });
    }
  }

  return recommendations.sort((a, b) => {
    const severityRank = { critical: 0, warning: 1, info: 2 };
    return (
      severityRank[a.severity as keyof typeof severityRank] -
      severityRank[b.severity as keyof typeof severityRank]
    );
  });
}
