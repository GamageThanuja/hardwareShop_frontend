"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paymentStatusLabels, salesOrderStatusLabels } from "@/lib/api/enum-labels";
import { getSalesOrder, updateSalesOrderStatus } from "@/lib/api/sales-orders";
import { PaymentStatus, SalesOrderStatus, type SalesOrderDto, type SalesOrderItemDto } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

const statusVariant: Record<SalesOrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [SalesOrderStatus.Draft]: "secondary",
  [SalesOrderStatus.Confirmed]: "default",
  [SalesOrderStatus.Processing]: "default",
  [SalesOrderStatus.Shipped]: "outline",
  [SalesOrderStatus.Delivered]: "default",
  [SalesOrderStatus.Cancelled]: "destructive",
};

const paymentStatusVariant: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [PaymentStatus.Unpaid]: "destructive",
  [PaymentStatus.Partial]: "secondary",
  [PaymentStatus.Paid]: "default",
};

export default function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<SalesOrderDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await getSalesOrder(id);
      setOrder(res.data);
      setNewStatus(String(res.data.status));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load sales order.");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdateStatus = async () => {
    if (!order || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await updateSalesOrderStatus(order.id, { status: Number(newStatus) as SalesOrderStatus });
      toast.success("Status updated.");
      setConfirmStatusOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally { setIsUpdatingStatus(false); }
  };

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (!order) return <div className="p-6 text-muted-foreground">Sales order not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNumber ?? "Sales Order"}</h1>
          <p className="text-muted-foreground text-sm">{order.customerName ?? "Walk-in customer"}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant={statusVariant[order.status]}>{salesOrderStatusLabels[order.status]}</Badge>
          <Badge variant={paymentStatusVariant[order.paymentStatus]}>{paymentStatusLabels[order.paymentStatus]}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Order Date</p><p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Grand Total</p><p className="font-medium">{formatCurrency(order.grandTotal)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Amount Paid</p><p className="font-medium">{formatCurrency(order.amountPaid)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Balance Due</p><p className={`font-medium ${order.balance > 0 ? "text-destructive" : ""}`}>{formatCurrency(order.balance)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Disc %</TableHead>
                <TableHead className="text-right">Tax %</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(order.items ?? []).map((item: SalesOrderItemDto) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.productSKU ?? "—"}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{item.discountPercent}%</TableCell>
                  <TableCell className="text-right">{item.taxPercent}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.subTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col items-end mt-4 gap-1 text-sm">
            <div className="flex gap-8"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subTotal)}</span></div>
            <div className="flex gap-8"><span className="text-muted-foreground">Discount</span><span>-{formatCurrency(order.discountAmount)}</span></div>
            <div className="flex gap-8"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(order.taxAmount)}</span></div>
            <div className="flex gap-8 font-semibold text-base border-t pt-1"><span>Grand Total</span><span>{formatCurrency(order.grandTotal)}</span></div>
          </div>
        </CardContent>
      </Card>

      {order.notes && (
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground mb-1">Notes</p><p>{order.notes}</p></CardContent></Card>
      )}

      <Card>
        <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(salesOrderStatusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setConfirmStatusOpen(true)} disabled={isUpdatingStatus || newStatus === String(order.status)}>Update</Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmStatusOpen}
        onOpenChange={setConfirmStatusOpen}
        title="Update Status"
        description={`Change status to "${salesOrderStatusLabels[Number(newStatus) as SalesOrderStatus]}"?`}
        onConfirm={handleUpdateStatus}
        isLoading={isUpdatingStatus}
        confirmLabel="Update"
      />
    </div>
  );
}
