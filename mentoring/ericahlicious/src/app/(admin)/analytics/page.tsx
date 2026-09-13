"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getSalesReport,
  getInventoryReport,
  getProfitabilityReport,
} from "@/lib/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SalesItem {
  name: string;
  quantity: number;
  revenue: number;
  count: number;
}

interface InventoryItem {
  name: string;
  category: string;
  totalReceived: number;
  totalConsumed: number;
  totalWaste: number;
  wastePercent: number;
}

interface ProfitItem {
  category: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  count: number;
}

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [salesData, setSalesData] = useState<{ totalOrders: number; totalRevenue: number; items: SalesItem[] } | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [profitData, setProfitData] = useState<ProfitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"sales" | "inventory" | "profitability">("sales");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [sales, inventory, profit] = await Promise.all([
        getSalesReport(new Date(startDate), new Date(endDate)),
        getInventoryReport(new Date(startDate), new Date(endDate)),
        getProfitabilityReport(new Date(startDate), new Date(endDate)),
      ]);
      setSalesData(sales);
      setInventoryData(inventory);
      setProfitData(profit);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📈 Analytics</h1>
        <p className="text-gray-600 mt-1">Business intelligence and performance metrics</p>
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={loadAnalytics} disabled={loading}>
              {loading ? "Loading..." : "📊 Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "sales" ? "default" : "ghost"}
          onClick={() => setActiveTab("sales")}
        >
          📈 Sales
        </Button>
        <Button
          variant={activeTab === "inventory" ? "default" : "ghost"}
          onClick={() => setActiveTab("inventory")}
        >
          🏪 Inventory
        </Button>
        <Button
          variant={activeTab === "profitability" ? "default" : "ghost"}
          onClick={() => setActiveTab("profitability")}
        >
          💰 Profitability
        </Button>
      </div>

      {/* Sales Tab */}
      {activeTab === "sales" && salesData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{salesData.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${salesData.totalRevenue.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Best Sellers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {salesData.items.slice(0, 10).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-600">
                        {item.count} orders · {item.quantity} units
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${item.revenue.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">
                        ${(item.revenue / item.count).toFixed(2)}/order
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory Usage & Waste</CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryData.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No inventory data for this period</p>
            ) : (
              <div className="space-y-2">
                {inventoryData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded border-l-4 border-l-gray-300"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-600">
                        Category: {item.category}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Received: {item.totalReceived.toFixed(2)} | Consumed:{" "}
                        {item.totalConsumed.toFixed(2)} | Waste:{" "}
                        {item.totalWaste.toFixed(2)}
                      </div>
                    </div>
                    <Badge
                      variant={item.wastePercent > 10 ? "destructive" : item.wastePercent > 5 ? "secondary" : "outline"}
                    >
                      {item.wastePercent.toFixed(1)}% waste
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profitability Tab */}
      {activeTab === "profitability" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profitability by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {profitData.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sales data for this period</p>
            ) : (
              <div className="space-y-2">
                {profitData.map((item, idx) => {
                  const marginPercent =
                    item.totalRevenue > 0
                      ? ((item.totalProfit / item.totalRevenue) * 100).toFixed(0)
                      : "0";

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded border-l-4 border-l-blue-400"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{item.category}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {item.count} items sold
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-green-600">
                            ${item.totalProfit.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {marginPercent}% margin
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2 text-xs text-gray-600">
                        <span>Revenue: ${item.totalRevenue.toFixed(2)}</span>
                        <span>·</span>
                        <span>Cost: ${item.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
