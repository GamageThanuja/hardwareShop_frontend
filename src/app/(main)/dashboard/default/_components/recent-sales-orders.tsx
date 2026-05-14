import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { salesOrderStatusLabels } from "@/lib/api/enum-labels";
import { SalesOrderStatus } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";
import type { RecentOrderDto } from "@/lib/api/types";

const statusVariant: Record<number, "default" | "secondary" | "destructive" | "outline"> = {
  [SalesOrderStatus.Draft]: "outline",
  [SalesOrderStatus.Confirmed]: "secondary",
  [SalesOrderStatus.Processing]: "secondary",
  [SalesOrderStatus.Shipped]: "default",
  [SalesOrderStatus.Delivered]: "default",
  [SalesOrderStatus.Cancelled]: "destructive",
};

export function RecentSalesOrders({ orders }: { orders: RecentOrderDto[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Recent Sales Orders</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/sales-orders">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground px-6 pb-4">No recent orders.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                  <TableCell>{o.customerName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(o.orderDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[o.status] ?? "outline"}>
                      {salesOrderStatusLabels[o.status as SalesOrderStatus] ?? o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(o.grandTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
