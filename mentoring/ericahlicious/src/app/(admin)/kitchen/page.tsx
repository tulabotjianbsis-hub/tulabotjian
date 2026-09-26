"use client";

import { useState, useCallback, useEffect } from "react";
import { getKitchenOrders, updateOrderStatus } from "@/lib/actions/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


interface OrderItem {
  id: string;
  quantity: number;
  specialInstructions: string | null;
  menuItem: {
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  type: string;
  tableNumber: number | null;
  specialInstructions: string | null;
  items: OrderItem[];
  createdAt: Date;
}

export default function KitchenDisplayPage() {
  const [now, setNow] = useState(() => Date.now());
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const int = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(int);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const ordersData = await getKitchenOrders();
      setOrders(ordersData as any);
    } catch (error) {
      console.error("Failed to load kitchen orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // Refresh every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");

  const handleStartPreparing = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "PREPARING");
      await loadData();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "READY");
      await loadData();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading kitchen orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🍳 Kitchen Display System</h1>
        <p className="text-gray-600 mt-1">Real-time order management for kitchen staff</p>
      </div>

      {pendingOrders.length === 0 && preparingOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <p className="text-center text-gray-500 text-lg">✓ No orders to prepare</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⏳</span>
              <h2 className="text-xl font-bold">Pending ({pendingOrders.length})</h2>
            </div>

            {pendingOrders.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-gray-500">No pending orders</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <Card key={order.id} className="border-2 border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold text-orange-900">
                            Order #{order.orderNumber}
                          </CardTitle>
                          <p className="text-xs text-orange-700 mt-1">
                            {Math.round(
                              (now - new Date(order.createdAt).getTime()) / 1000
                            )}s ago
                          </p>
                        </div>
                        {order.tableNumber && (
                          <Badge className="bg-orange-600">
                            Table {order.tableNumber}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-sm font-medium">
                            <span className="text-lg">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            {item.specialInstructions && (
                              <p className="text-xs text-orange-700 mt-1">
                                📝 {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {order.specialInstructions && (
                        <div className="bg-white p-2 rounded border-l-2 border-orange-400 text-sm">
                          <p className="font-semibold text-orange-900">Special Notes:</p>
                          <p className="text-orange-700">{order.specialInstructions}</p>
                        </div>
                      )}
                      <Button
                        onClick={() => handleStartPreparing(order.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2"
                      >
                        👨‍🍳 Start Preparing
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Preparing Orders */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👨‍🍳</span>
              <h2 className="text-xl font-bold">Preparing ({preparingOrders.length})</h2>
            </div>

            {preparingOrders.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-gray-500">No orders being prepared</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {preparingOrders.map((order) => (
                  <Card key={order.id} className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold text-blue-900">
                            Order #{order.orderNumber}
                          </CardTitle>
                          <p className="text-xs text-blue-700 mt-1">
                            Preparing for{" "}
                            {Math.round(
                              (now - new Date(order.createdAt).getTime()) / 1000
                            )}s
                          </p>
                        </div>
                        {order.tableNumber && (
                          <Badge className="bg-blue-600">
                            Table {order.tableNumber}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-sm font-medium">
                            <span className="text-lg">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            {item.specialInstructions && (
                              <p className="text-xs text-blue-700 mt-1">
                                📝 {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {order.specialInstructions && (
                        <div className="bg-white p-2 rounded border-l-2 border-blue-400 text-sm">
                          <p className="font-semibold text-blue-900">Special Notes:</p>
                          <p className="text-blue-700">{order.specialInstructions}</p>
                        </div>
                      )}
                      <Button
                        onClick={() => handleMarkReady(order.id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2"
                      >
                        ✅ Mark Ready
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="text-center text-xs text-gray-500">
        🔄 Auto-refreshing every 5 seconds
      </div>
    </div>
  );
}
