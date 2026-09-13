import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getDailyOrderStats } from "@/lib/actions/orders";
import { getIngredients } from "@/lib/actions/inventory";
import { getMenuItems } from "@/lib/actions/menu";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (role === "SUPERVISOR") {
    return <SupervisorDashboard />;
  } else if (role === "ADMIN") {
    return <AdminDashboard />;
  } else if (role === "OWNER") {
    return <OwnerDashboard />;
  }

  return <SupervisorDashboard />;
}

async function SupervisorDashboard() {
  const orderStats = await getDailyOrderStats();
  const ingredients = await getIngredients();

  const criticalItems = ingredients.filter((i) => i.status === "CRITICAL");
  const lowItems = ingredients.filter((i) => i.status === "LOW");
  const expiredItems = ingredients.filter(
    (i) => i.expiryDate && i.expiryDate < new Date()
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "destructive";
      case "LOW":
        return "secondary";
      case "EXPIRED":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Supervisor Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor inventory and manage daily operations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              {orderStats.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {orderStats.pending}
            </div>
            <p className="text-xs text-gray-500 mt-1">Ready to prepare</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Preparation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orderStats.preparing}
            </div>
            <p className="text-xs text-gray-500 mt-1">Being made now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Critical Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalItems.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical & Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">⚠️ Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-600 text-sm mb-2">
                  Critical Stock ({criticalItems.length})
                </h3>
                <div className="space-y-1">
                  {criticalItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="text-sm p-2 bg-red-50 rounded flex justify-between items-center"
                    >
                      <span>{item.name}</span>
                      <Badge variant="destructive">
                        {Number(item.stock).toFixed(1)} {item.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lowItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-orange-600 text-sm mb-2">
                  Low Stock ({lowItems.length})
                </h3>
                <div className="space-y-1">
                  {lowItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="text-sm p-2 bg-orange-50 rounded flex justify-between items-center"
                    >
                      <span>{item.name}</span>
                      <Badge variant="secondary">
                        {Number(item.stock).toFixed(1)} {item.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expiredItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-700 text-sm mb-2">
                  Expired ({expiredItems.length})
                </h3>
                <div className="space-y-1">
                  {expiredItems.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="text-sm p-2 bg-red-100 rounded flex justify-between items-center"
                    >
                      <span>{item.name}</span>
                      <Badge variant="destructive">EXPIRED</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {criticalItems.length === 0 &&
              lowItems.length === 0 &&
              expiredItems.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  ✓ All inventory looks good!
                </p>
              )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🚀 Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/kitchen"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              📺 View Kitchen Display
            </Link>
            <Link
              href="/orders?new=true"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
            >
              ➕ Create New Order
            </Link>
            <Link
              href="/inventory/adjustments"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
            >
              📦 Record Adjustment
            </Link>
            <Link
              href="/ingredients"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm font-medium"
            >
              🏪 View All Inventory
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function AdminDashboard() {
  const orderStats = await getDailyOrderStats();
  const menuItems = await getMenuItems({ includeArchived: false });
  const ingredients = await getIngredients();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage menu, inventory, and orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              ${orderStats.totalAmount.toFixed(2)} revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Menu Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ingredients.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orderStats.completed}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {orderStats.total > 0
                ? `${((orderStats.completed / orderStats.total) * 100).toFixed(0)}% completion`
                : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 Management Areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/menu"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              📋 Menu Management
            </Link>
            <Link
              href="/ingredients"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
            >
              🏪 Inventory Management
            </Link>
            <Link
              href="/orders"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
            >
              📦 Orders
            </Link>
            <Link
              href="/analytics"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm font-medium"
            >
              📈 Analytics
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">📌 Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Menu Items:</span>
              <span className="font-semibold">{menuItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Ingredients:</span>
              <span className="font-semibold">{ingredients.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Orders:</span>
              <span className="font-semibold text-orange-600">
                {orderStats.pending}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Preparation:</span>
              <span className="font-semibold text-blue-600">
                {orderStats.preparing}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function OwnerDashboard() {
  const orderStats = await getDailyOrderStats();
  const menuItems = await getMenuItems({ includeArchived: false });
  const ingredients = await getIngredients();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
        <p className="text-gray-600 mt-1">Executive overview and KPIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orderStats.totalAmount.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {orderStats.total} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {orderStats.total > 0
                ? (orderStats.totalAmount / orderStats.total).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Menu Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.length}</div>
            <p className="text-xs text-gray-500 mt-1">Available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {ingredients
                .reduce((sum, i) => sum + Number(i.stock) * 10, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {ingredients.length} items
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">🎯 Reports & Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/analytics"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            📈 Sales Analytics
          </Link>
          <Link
            href="/recommendations"
            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
          >
            💡 Recommendations
          </Link>
          <Link
            href="/alerts"
            className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm font-medium"
          >
            🔔 Alerts
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
