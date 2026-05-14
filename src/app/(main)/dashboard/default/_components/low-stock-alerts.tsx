import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LowStockAlertDto } from "@/lib/api/types";

export function LowStockAlerts({ alerts }: { alerts: LowStockAlertDto[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <CardTitle className="text-base">Low Stock Alerts</CardTitle>
        {alerts.length > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {alerts.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground px-6 pb-4">All stock levels are healthy.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">On Hand</TableHead>
                <TableHead className="text-right">Reorder At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((a) => (
                <TableRow key={`${a.productId}-${a.warehouseName}`}>
                  <TableCell className="font-mono text-xs">{a.sku}</TableCell>
                  <TableCell>{a.productName}</TableCell>
                  <TableCell>{a.warehouseName}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="destructive">{a.quantityOnHand}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{a.reorderLevel}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
