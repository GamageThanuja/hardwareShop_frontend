import { getDashboard } from "@/lib/api/dashboard";
import type { DashboardDto } from "@/lib/api/types";

import { KpiCards } from "./_components/kpi-cards";
import { LowStockAlerts } from "./_components/low-stock-alerts";
import { RecentSalesOrders } from "./_components/recent-sales-orders";
import { SalesSummary } from "./_components/sales-summary";

export default async function DefaultDashboardPage() {
  let dashboard: DashboardDto;
  try {
    const res = await getDashboard();
    dashboard = res.data;
  } catch (error) {
    console.error("Failed to load dashboard data", error);
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Unable to load dashboard data. Please ensure the API is running.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground text-sm">Hardware inventory overview</p>
      </div>
      <KpiCards data={dashboard} />
      <SalesSummary data={dashboard} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LowStockAlerts alerts={dashboard.lowStockAlerts ?? []} />
        <RecentSalesOrders orders={dashboard.recentSalesOrders ?? []} />
      </div>
    </div>
  );
}
