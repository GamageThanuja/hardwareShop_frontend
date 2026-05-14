"use client";

import { useCallback, useState } from "react";

import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { paymentMethodLabels, purchaseOrderStatusLabels, salesOrderStatusLabels } from "@/lib/api/enum-labels";
import { getInventoryReport, getPurchaseReport, getSalesReport } from "@/lib/api/reports";
import {
  PaymentMethod,
  PurchaseOrderStatus,
  SalesOrderStatus,
  type InventoryValuationDto,
  type InventoryValuationItemDto,
  type PurchaseReportDto,
  type SalesReportDto,
} from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

function DateRangeFilter({ onSearch, isLoading }: { onSearch: (from: string, to: string) => void; isLoading: boolean }) {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);

  return (
    <div className="flex gap-2 items-end mb-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">From</label>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">To</label>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
      </div>
      <Button onClick={() => onSearch(from, to)} disabled={isLoading}>{isLoading ? "Loading…" : "Generate"}</Button>
    </div>
  );
}

function SalesReport() {
  const [report, setReport] = useState<SalesReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (from: string, to: string) => {
    setIsLoading(true);
    try {
      const res = await getSalesReport({ dateFrom: from, dateTo: to });
      setReport(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load sales report.");
    } finally { setIsLoading(false); }
  }, []);

  return (
    <div className="space-y-6">
      <DateRangeFilter onSearch={load} isLoading={isLoading} />
      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-2xl font-semibold">{report.totalOrders}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Revenue</p><p className="text-2xl font-semibold">{formatCurrency(report.totalRevenue)}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Amount Paid</p><p className="text-2xl font-semibold">{formatCurrency(report.totalAmountPaid)}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-2xl font-semibold text-destructive">{formatCurrency(report.totalOutstanding)}</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Tax</p><p className="text-xl font-medium">{formatCurrency(report.totalTax)}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Discount</p><p className="text-xl font-medium">{formatCurrency(report.totalDiscount)}</p></CardContent></Card>
          </div>
          {(report.byStatus ?? []).length > 0 && (
            <Card>
              <CardHeader><CardTitle>By Status</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Status</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(report.byStatus ?? []).map((row) => (
                      <TableRow key={row.status}>
                        <TableCell>{salesOrderStatusLabels[row.status as SalesOrderStatus]}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          {(report.topProducts ?? []).length > 0 && (
            <Card>
              <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Product</TableHead><TableHead className="text-right">Qty Sold</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(report.topProducts ?? []).map((p) => (
                      <TableRow key={p.productId}>
                        <TableCell className="font-mono text-xs">{p.sku ?? "—"}</TableCell>
                        <TableCell>{p.productName}</TableCell>
                        <TableCell className="text-right">{p.quantitySold}</TableCell>
                        <TableCell className="text-right">{formatCurrency(p.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          {(report.byPaymentMethod ?? []).length > 0 && (
            <Card>
              <CardHeader><CardTitle>By Payment Method</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Method</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(report.byPaymentMethod ?? []).map((row) => (
                      <TableRow key={row.method}>
                        <TableCell>{paymentMethodLabels[row.method as PaymentMethod]}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function InventoryReport() {
  const [report, setReport] = useState<InventoryValuationDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await getInventoryReport({ Page: p, PageSize: 50 });
      setReport(res.data);
      setPage(p);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load inventory report.");
    } finally { setIsLoading(false); }
  }, []);

  return (
    <div className="space-y-4">
      <Button onClick={() => load(1)} disabled={isLoading}>{isLoading ? "Loading…" : "Load Report"}</Button>
      {report && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Products</p><p className="text-2xl font-semibold">{report.totalProducts}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Units</p><p className="text-2xl font-semibold">{report.totalUnits}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Value</p><p className="text-2xl font-semibold">{formatCurrency(report.totalValue)}</p></CardContent></Card>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Cost Price</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(report.items ?? []).map((item: InventoryValuationItemDto) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-mono text-xs">{item.sku ?? "—"}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.categoryName ?? "—"}</TableCell>
                      <TableCell className="text-right">{item.totalUnits}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.costPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                <span>Page {report.page} of {report.totalPages} ({report.totalCount} items)</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => load(page - 1)} disabled={page <= 1 || isLoading}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => load(page + 1)} disabled={page >= report.totalPages || isLoading}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function PurchasesReport() {
  const [report, setReport] = useState<PurchaseReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (from: string, to: string) => {
    setIsLoading(true);
    try {
      const res = await getPurchaseReport({ dateFrom: from, dateTo: to });
      setReport(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load purchase report.");
    } finally { setIsLoading(false); }
  }, []);

  return (
    <div className="space-y-6">
      <DateRangeFilter onSearch={load} isLoading={isLoading} />
      {report && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-2xl font-semibold">{report.totalOrders}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Amount</p><p className="text-2xl font-semibold">{formatCurrency(report.totalAmount)}</p></CardContent></Card>
          </div>
          {(report.byStatus ?? []).length > 0 && (
            <Card>
              <CardHeader><CardTitle>By Status</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Status</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(report.byStatus ?? []).map((row) => (
                      <TableRow key={row.status}>
                        <TableCell>{purchaseOrderStatusLabels[row.status as PurchaseOrderStatus]}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          {(report.bySupplier ?? []).length > 0 && (
            <Card>
              <CardHeader><CardTitle>By Supplier</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(report.bySupplier ?? []).map((row) => (
                      <TableRow key={row.supplierId}>
                        <TableCell>{row.supplierName ?? "—"}</TableCell>
                        <TableCell className="text-right">{row.orderCount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Business intelligence and analytics" />
      <Tabs defaultValue="sales">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="sales"><SalesReport /></TabsContent>
        <TabsContent value="inventory"><InventoryReport /></TabsContent>
        <TabsContent value="purchases"><PurchasesReport /></TabsContent>
      </Tabs>
    </div>
  );
}
