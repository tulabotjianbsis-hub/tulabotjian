"use client";

import { useEffect, useState, useCallback } from "react";
import { getRecommendations } from "@/lib/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
  type: string;
  severity: string;
  title: string;
  description: string;
  data: Record<string, any>;
}

const getIcon = (type: string) => {
  switch (type) {
    case "REORDER":
      return "📦";
    case "WASTE_ALERT":
      return "🗑️";
    case "MENU_OPTIMIZATION":
      return "📊";
    default:
      return "💡";
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

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const recs = await getRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
    // Refresh every minute
    const interval = setInterval(loadRecommendations, 60000);
    return () => clearInterval(interval);
  }, [loadRecommendations]);

  const dismissRecommendation = (idx: number) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(idx.toString());
    setDismissedIds(newDismissed);
  };

  const visibleRecommendations = recommendations.filter(
    (_, idx) => !dismissedIds.has(idx.toString())
  );

  const criticalRecs = visibleRecommendations.filter(
    (r) => r.severity === "critical"
  );
  const warningRecs = visibleRecommendations.filter(
    (r) => r.severity === "warning"
  );
  const infoRecs = visibleRecommendations.filter((r) => r.severity === "info");

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💡 Recommendations</h1>
          <p className="text-gray-600 mt-1">Data-driven suggestions to optimize operations</p>
        </div>
        <Button onClick={loadRecommendations} variant="outline" size="sm">
          🔄 Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visibleRecommendations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">🔴 Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalRecs.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-600">🟠 Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {warningRecs.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Recommendations */}
      {criticalRecs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-red-700">
            🔴 Critical Recommendations ({criticalRecs.length})
          </h2>
          {criticalRecs.map((rec, idx) => {
            const recIdx = recommendations.indexOf(rec);
            return (
              <Card
                key={recIdx}
                className="border-l-4 border-l-red-600 bg-red-50"
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getIcon(rec.type)}</span>
                        <h3 className="font-semibold text-red-900 text-lg">
                          {rec.title}
                        </h3>
                      </div>
                      <p className="text-sm text-red-800 mb-3">
                        {rec.description}
                      </p>
                      {rec.type === "REORDER" && (
                        <Button className="bg-red-600 hover:bg-red-700 text-white text-sm">
                          📋 Create Purchase Order
                        </Button>
                      )}
                      {rec.type === "WASTE_ALERT" && (
                        <Button className="bg-red-600 hover:bg-red-700 text-white text-sm">
                          🔍 View Audit Trail
                        </Button>
                      )}
                      {rec.type === "MENU_OPTIMIZATION" && (
                        <Button className="bg-red-600 hover:bg-red-700 text-white text-sm">
                          📊 Edit Item
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissRecommendation(recIdx)}
                      className="ml-2 text-red-600"
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Warning Recommendations */}
      {warningRecs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-orange-700">
            🟠 Warning Recommendations ({warningRecs.length})
          </h2>
          {warningRecs.map((rec, idx) => {
            const recIdx = recommendations.indexOf(rec);
            return (
              <Card
                key={recIdx}
                className="border-l-4 border-l-orange-400 bg-orange-50"
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getIcon(rec.type)}</span>
                        <h3 className="font-semibold text-orange-900 text-lg">
                          {rec.title}
                        </h3>
                      </div>
                      <p className="text-sm text-orange-800 mb-3">
                        {rec.description}
                      </p>
                      {rec.type === "REORDER" && (
                        <Button variant="secondary" size="sm">
                          📋 Create Purchase Order
                        </Button>
                      )}
                      {rec.type === "WASTE_ALERT" && (
                        <Button variant="secondary" size="sm">
                          🔍 View Details
                        </Button>
                      )}
                      {rec.type === "MENU_OPTIMIZATION" && (
                        <Button variant="secondary" size="sm">
                          📊 View Analytics
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissRecommendation(recIdx)}
                      className="ml-2 text-orange-600"
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Recommendations */}
      {infoRecs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-blue-700">
            ℹ️ Info Recommendations ({infoRecs.length})
          </h2>
          {infoRecs.map((rec, idx) => {
            const recIdx = recommendations.indexOf(rec);
            return (
              <Card
                key={recIdx}
                className="border-l-4 border-l-blue-400 bg-blue-50"
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getIcon(rec.type)}</span>
                        <h3 className="font-semibold text-blue-900 text-lg">
                          {rec.title}
                        </h3>
                      </div>
                      <p className="text-sm text-blue-800">
                        {rec.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissRecommendation(recIdx)}
                      className="ml-2 text-blue-600"
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {visibleRecommendations.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-gray-500 text-lg">✓ No recommendations</p>
            <p className="text-gray-400 text-sm mt-2">
              You're all set! New recommendations will appear as data patterns emerge.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Auto-refresh indicator */}
      <div className="text-center text-xs text-gray-500">
        🔄 Auto-refreshing every minute
      </div>
    </div>
  );
}
