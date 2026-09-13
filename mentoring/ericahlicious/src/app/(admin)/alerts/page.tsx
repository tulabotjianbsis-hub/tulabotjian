"use client";

import { useEffect, useState, useCallback } from "react";
import { getAlerts, dismissAlert, checkAndCreateAlerts } from "@/lib/actions/alerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string | null;
  severity: string;
  dismissed: boolean;
  createdAt: Date;
  ingredient?: { name: string } | null;
  order?: { orderNumber: number } | null;
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case "LOW_STOCK":
      return "🟠";
    case "CRITICAL_STOCK":
      return "🔴";
    case "EXPIRY_WARNING":
      return "⏰";
    case "EXPIRY_CRITICAL":
      return "☠️";
    case "ORDER_OVERDUE":
      return "⏱️";
    default:
      return "📋";
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "destructive";
    case "warning":
      return "secondary";
    default:
      return "outline";
  }
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      // First check and create new alerts
      await checkAndCreateAlerts();
      // Then fetch
      const alertsData = await getAlerts(false);
      setAlerts(alertsData);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    // Refresh every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  const handleDismiss = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      await loadAlerts();
    } catch (error) {
      console.error("Failed to dismiss alert:", error);
    }
  };

  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");
  const infoAlerts = alerts.filter((a) => a.severity === "info");

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔔 Alerts</h1>
          <p className="text-gray-600 mt-1">Active system alerts and notifications</p>
        </div>
        <Button onClick={loadAlerts} variant="outline" size="sm">
          🔄 Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">🔴 Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalAlerts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-600">🟠 Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {warningAlerts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-600">ℹ️ Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {infoAlerts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-red-700">
            🔴 Critical Alerts ({criticalAlerts.length})
          </h2>
          {criticalAlerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-red-600 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getAlertIcon(alert.type)}</span>
                      <h3 className="font-semibold text-red-900">{alert.title}</h3>
                    </div>
                    {alert.description && (
                      <p className="text-sm text-red-800 ml-7">
                        {alert.description}
                      </p>
                    )}
                    <p className="text-xs text-red-700 ml-7 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(alert.id)}
                    className="ml-2"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-orange-700">
            🟠 Warning Alerts ({warningAlerts.length})
          </h2>
          {warningAlerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-orange-400 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getAlertIcon(alert.type)}</span>
                      <h3 className="font-semibold text-orange-900">
                        {alert.title}
                      </h3>
                    </div>
                    {alert.description && (
                      <p className="text-sm text-orange-800 ml-7">
                        {alert.description}
                      </p>
                    )}
                    <p className="text-xs text-orange-700 ml-7 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(alert.id)}
                    className="ml-2"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Alerts */}
      {infoAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-blue-700">
            ℹ️ Info Alerts ({infoAlerts.length})
          </h2>
          {infoAlerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-blue-400 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getAlertIcon(alert.type)}</span>
                      <h3 className="font-semibold text-blue-900">{alert.title}</h3>
                    </div>
                    {alert.description && (
                      <p className="text-sm text-blue-800 ml-7">
                        {alert.description}
                      </p>
                    )}
                    <p className="text-xs text-blue-700 ml-7 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(alert.id)}
                    className="ml-2"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {alerts.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-gray-500 text-lg">✓ No active alerts</p>
            <p className="text-gray-400 text-sm mt-2">
              Everything looks good! Alerts will appear here when issues are detected.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Auto-refresh indicator */}
      <div className="text-center text-xs text-gray-500">
        🔄 Auto-refreshing every 30 seconds
      </div>
    </div>
  );
}
