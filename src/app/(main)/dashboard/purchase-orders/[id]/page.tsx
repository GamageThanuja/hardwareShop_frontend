"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { purchaseOrderStatusLabels } from "@/lib/api/enum-labels";
import { getPurchaseOrder, receivePurchaseOrder, updatePurchaseOrderStatus } from "@/lib/api/purchase-orders";
import { PurchaseOrderStatus, type PurchaseOrderDto, type PurchaseOrderItemDto } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

const statusVariant: Record<PurchaseOrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [PurchaseOrderStatus.Draft]: "secondary",
  [PurchaseOrderStatus.Pending]: "secondary",
  [PurchaseOrderStatus.Ordered]: "default",
  [PurchaseOrderStatus.Received]: "default",
  [PurchaseOrderStatus.Cancelled]: "destructive",
};

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [po, setPo] = useState<PurchaseOrderDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [isReceiving, setIsReceiving] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await getPurchaseOrder(id);
      setPo(res.data);
      setNewStatus(String(res.data.status));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load purchase order.");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdateStatus = async () => {
    if (!po || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await updatePurchaseOrderStatus(po.id, { status: Number(newStatus) as PurchaseOrderStatus });
      toast.success("Status updated.");
      setConfirmStatusOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally { setIsUpdatingStatus(false); }
  };

  const handleReceive = async () => {
    if (!po) return;
    setIsReceiving(true);
    try {
      const items = (po.items ?? []).map((item: PurchaseOrderItemDto) => ({
        purchaseOrderItemId: item.id,
        receivedQuantity: receivedQtys[item.id] ?? item.receivedQuantity,
      }));
      await receivePurchaseOrder(po.id, items);
      toast.success("Items received.");
      setShowReceive(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to receive items.");
    } finally { setIsReceiving(false); }
  };

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (!po) return <div className="p-6 text-muted-foreground">Purchase order not found.</div>;

  const canReceive = po.status === PurchaseOrderStatus.Ordered || po.status === PurchaseOrderStatus.Pending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <div>
          <h1 className="text-2xl font-semibold">{po.poNumber ?? "Purchase Order"}</h1>
          <p className="text-muted-foreground text-sm">{po.supplierName}</p>
        </div>
        <Badge className="ml-auto" variant={statusVariant[po.status]}>{purchaseOrderStatusLabels[po.status]}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Order Date</p><p className="font-medium">{new Date(po.orderDate).toLocaleDateString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Expected Delivery</p><p className="font-medium">{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : "—"}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Amount</p><p className="font-medium">{formatCurrency(po.totalAmount)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Notes</p><p className="font-medium truncate">{po.notes ?? "—"}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          {canReceive && (
            <Button size="sm" variant="outline" onClick={() => {
              const initial: Record<string, number> = {};
              for (const item of po.items ?? []) initial[item.id] = item.receivedQuantity;
              setReceivedQtys(initial);
              setShowReceive(!showReceive);
            }}>
              {showReceive ? "Cancel Receive" : "Receive Items"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Ordered</TableHead>
                <TableHead className="text-right">Received</TableHead>
                {showReceive && <TableHead className="text-right">Receive Now</TableHead>}
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(po.items ?? []).map((item: PurchaseOrderItemDto) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.productSKU ?? "—"}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.receivedQuantity}</TableCell>
                  {showReceive && (
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity}
                        className="w-20 ml-auto"
                        value={receivedQtys[item.id] ?? item.receivedQuantity}
                        onChange={(e) => setReceivedQtys((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.subTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {showReceive && (
            <div className="flex justify-end mt-4">
              <Button onClick={handleReceive} disabled={isReceiving}>{isReceiving ? "Receiving…" : "Confirm Receipt"}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(purchaseOrderStatusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setConfirmStatusOpen(true)} disabled={isUpdatingStatus || newStatus === String(po.status)}>Update</Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmStatusOpen}
        onOpenChange={setConfirmStatusOpen}
        title="Update Status"
        description={`Change status to "${purchaseOrderStatusLabels[Number(newStatus) as PurchaseOrderStatus]}"?`}
        onConfirm={handleUpdateStatus}
        isLoading={isUpdatingStatus}
        confirmLabel="Update"
      />
    </div>
  );
}
