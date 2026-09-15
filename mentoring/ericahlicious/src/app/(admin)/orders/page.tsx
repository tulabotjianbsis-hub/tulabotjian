"use client";

import { useState, useCallback, useEffect } from "react";
import { getOrders, updateOrderStatus } from "@/lib/actions/orders";
import { getMenuItems } from "@/lib/actions/menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderForm } from "@/components/orders/order-form";

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  menuItem: {
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  type: string;
  totalAmount: number;
  tableNumber: number | null;
  items: OrderItem[];
  createdAt: Date;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, menuData] = await Promise.all([
        getOrders(),
        getMenuItems({ includeArchived: false }),
      ]);
      setOrders(ordersData);
      setMenuItems(menuData);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const filteredOrders = orders.filter(
    (order) =>
      selectedStatus === "all" || order.status === selectedStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "PREPARING":
        return "default";
      case "READY":
        return "default";
      case "COMPLETED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "⏳";
      case "PREPARING":
        return "👨‍🍳";
      case "READY":
        return "✅";
      case "COMPLETED":
        return "🎉";
      case "CANCELLED":
        return "❌";
      default:
        return "📋";
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as OrderStatus);
      await loadData();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const nextStatus = (currentStatus: string): string | null => {
    const workflow: Record<string, string | null> = {
      PENDING: "PREPARING",
      PREPARING: "READY",
      READY: "COMPLETED",
      COMPLETED: null,
      CANCELLED: null,
    };
    return workflow[currentStatus];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage and track customer orders</p>
      </div>

      <div className="flex gap-4">
        <Select value={selectedStatus} onValueChange={(value) => { if (value !== null) setSelectedStatus(value); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">⏳ Pending</SelectItem>
            <SelectItem value="PREPARING">👨‍🍳 Preparing</SelectItem>
            <SelectItem value="READY">✅ Ready</SelectItem>
            <SelectItem value="COMPLETED">🎉 Completed</SelectItem>
            <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 ml-auto"
        >
          + New Order
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Loading orders...</p>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)} {order.status}
                    </Badge>
                    {order.type === "DINE_IN" && order.tableNumber && (
                      <Badge variant="outline">🍽️ Table {order.tableNumber}</Badge>
                    )}
                    {order.type === "TAKE_OUT" && (
                      <Badge variant="outline">📦 Take Out</Badge>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-4 pb-4 border-b">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="font-medium">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total & Actions */}
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold">
                    Total: ${order.totalAmount.toFixed(2)}
                  </div>

                  <div className="flex gap-2">
                    {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                      <>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            value !== null && handleStatusChange(order.id, value as OrderStatus)
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={order.status}>
                              {order.status}
                            </SelectItem>
                            {nextStatus(order.status) && (
                              <SelectItem value={nextStatus(order.status)!}>
                                {nextStatus(order.status)}
                              </SelectItem>
                            )}
                            <SelectItem value="CANCELLED">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    {(order.status === "COMPLETED" || order.status === "CANCELLED") && (
                      <Button variant="outline" size="sm" disabled>
                        {order.status}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailOpen(true);
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Order Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Add items and create a new customer order
            </DialogDescription>
          </DialogHeader>
          <OrderForm
            menuItems={menuItems}
            onSuccess={() => {
              setIsCreateOpen(false);
              loadData();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription>
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold">
                    {selectedOrder.type === "DINE_IN" ? "🍽️ Dine In" : "📦 Take Out"}
                  </span>
                </div>
                {selectedOrder.tableNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Table:</span>
                    <span className="font-semibold">{selectedOrder.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={getStatusColor(selectedOrder.status)}>
                    {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-3">
                <h4 className="font-semibold text-sm mb-2">Items</h4>
                <div className="space-y-1">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
