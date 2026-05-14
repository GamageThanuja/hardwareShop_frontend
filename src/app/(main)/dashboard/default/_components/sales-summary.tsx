import { CalendarDays, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardDto } from "@/lib/api/types";

export function SalesSummary({ data }: { data: DashboardDto }) {
  const { todaySales, monthSales } = data;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Sales</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(todaySales.totalAmount)}</p>
          <p className="text-xs text-muted-foreground mt-1">{todaySales.orderCount} orders today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(monthSales.totalAmount)}</p>
          <p className="text-xs text-muted-foreground mt-1">{monthSales.orderCount} orders this month</p>
        </CardContent>
      </Card>
    </div>
  );
}
