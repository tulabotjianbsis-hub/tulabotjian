import { getSalesReport, getTopSellingItems } from "@/lib/actions/analytics";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  // Default to week on server render — client handles period switching
  const [salesReport, topItems] = await Promise.all([
    getSalesReport("week"),
    getTopSellingItems("week"),
  ]);

  return <ReportsClient initialSales={salesReport} initialTopItems={topItems} />;
}
