"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Controller, type Resolver, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { PageHeader } from "@/components/page-header";
import { RowActions } from "@/components/row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { purchaseReturnStatusLabels } from "@/lib/api/enum-labels";
import { listProducts } from "@/lib/api/products";
import { listPurchaseOrders } from "@/lib/api/purchase-orders";
import { cancelPurchaseReturn, createPurchaseReturn, listPurchaseReturns } from "@/lib/api/purchase-returns";
import {
  type PurchaseOrderDto,
  type PurchaseReturnDto,
  PurchaseReturnStatus,
  type WarehouseDto,
} from "@/lib/api/types";
import { listWarehouses } from "@/lib/api/warehouses";

const statusVariant: Record<PurchaseReturnStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [PurchaseReturnStatus.Pending]: "secondary",
  [PurchaseReturnStatus.Cancelled]: "destructive",
};

const itemSchema = z.object({
  productId: z.string().min(1, "Required"),
  quantity: z.coerce.number().int().min(1, "Min 1"),
  notes: z.string().optional(),
});

const schema = z.object({
  purchaseOrderId: z.string().min(1, "Purchase order is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  returnDate: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});
type FormValues = z.infer<typeof schema>;

function PurchaseReturnForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  purchaseOrders,
  warehouses,
  products,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: FormValues) => Promise<void>;
  isLoading?: boolean;
  purchaseOrders: PurchaseOrderDto[];
  warehouses: WarehouseDto[];
  products: { id: string; name: string | null; sku: string | null }[];
}) {
  const today = new Date().toISOString().split("T")[0];
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      purchaseOrderId: "",
      warehouseId: "",
      returnDate: today,
      reason: "",
      notes: "",
      items: [{ productId: "", quantity: 1, notes: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (!open)
      form.reset({
        purchaseOrderId: "",
        warehouseId: "",
        returnDate: today,
        reason: "",
        notes: "",
        items: [{ productId: "", quantity: 1, notes: "" }],
      });
  }, [open, form, today]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Purchase Return</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(async (v) => {
            await onSubmit(v);
          })}
          className="space-y-4"
        >
          <FieldGroup className="gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="purchaseOrderId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Purchase Order *</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select PO" />
                      </SelectTrigger>
                      <SelectContent>
                        {purchaseOrders.map((po) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.poNumber ?? po.id.slice(0, 8)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="warehouseId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Warehouse *</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Controller
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Return Date</FieldLabel>
                    <Input {...field} type="date" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Reason</FieldLabel>
                    <Input {...field} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Notes</FieldLabel>
                    <Input {...field} />
                  </Field>
                )}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Items *</FieldLabel>
              {fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-[1fr_80px_1fr_32px] items-end gap-2">
                  <Controller
                    control={form.control}
                    name={`items.${i}.productId`}
                    render={({ field }) => (
                      <Field>
                        {i === 0 && <FieldLabel className="text-muted-foreground text-xs">Product</FieldLabel>}
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.sku ? `[${p.sku}] ` : ""}
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`items.${i}.quantity`}
                    render={({ field }) => (
                      <Field>
                        {i === 0 && <FieldLabel className="text-muted-foreground text-xs">Qty</FieldLabel>}
                        <Input {...field} type="number" min="1" />
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`items.${i}.notes`}
                    render={({ field }) => (
                      <Field>
                        {i === 0 && <FieldLabel className="text-muted-foreground text-xs">Notes</FieldLabel>}
                        <Input {...field} placeholder="Optional" />
                      </Field>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => remove(i)}
                    disabled={fields.length === 1}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: "", quantity: 1, notes: "" })}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Item
              </Button>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Create Return"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PurchaseReturnsPage() {
  const [items, setItems] = useState<PurchaseReturnDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<PurchaseReturnDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string | null; sku: string | null }[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listPurchaseReturns({ Page: page, PageSize: pageSize });
      const d = res.data;
      setItems(d.items ?? []);
      setTotalCount(d.totalCount);
      setTotalPages(d.totalPages);
      setHasPrevious(d.hasPrevious);
      setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load purchase returns.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    listPurchaseOrders({ PageSize: 500 })
      .then((r) => setPurchaseOrders(r.data.items ?? []))
      .catch(() => {
        /* noop */
      });
    listWarehouses({ PageSize: 200 })
      .then((r) => setWarehouses(r.data.items ?? []))
      .catch(() => {
        /* noop */
      });
    listProducts({ PageSize: 500 })
      .then((r) => setProducts(r.data.items?.map((p) => ({ id: p.id, name: p.name, sku: p.sku })) ?? []))
      .catch(() => {
        /* noop */
      });
  }, []);

  const columns: ColumnDef<PurchaseReturnDto, unknown>[] = [
    {
      accessorKey: "returnNumber",
      header: "Return #",
      cell: ({ getValue }) => <span className="font-mono text-xs">{(getValue() as string | null) ?? "—"}</span>,
    },
    {
      accessorKey: "poNumber",
      header: "PO #",
      cell: ({ getValue }) => <span className="font-mono text-xs">{(getValue() as string | null) ?? "—"}</span>,
    },
    { accessorKey: "supplierName", header: "Supplier", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    {
      accessorKey: "returnDate",
      header: "Date",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    { accessorKey: "reason", header: "Reason", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const s = getValue() as PurchaseReturnStatus;
        return <Badge variant={statusVariant[s]}>{purchaseReturnStatusLabels[s]}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <RowActions
          actions={[
            ...(row.original.status === PurchaseReturnStatus.Pending
              ? [{ label: "Cancel", onClick: () => setCancelTarget(row.original), destructive: true }]
              : []),
          ]}
        />
      ),
    },
  ];

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      await createPurchaseReturn({
        purchaseOrderId: values.purchaseOrderId,
        warehouseId: values.warehouseId,
        returnDate: values.returnDate || undefined,
        reason: values.reason || undefined,
        notes: values.notes || undefined,
        items: values.items,
      });
      toast.success("Purchase return created.");
      setFormOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create purchase return.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await cancelPurchaseReturn(cancelTarget.id);
      toast.success("Purchase return cancelled.");
      setCancelTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel purchase return.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Purchase Returns"
        description="Manage returns to suppliers"
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Return
          </Button>
        }
      />
      <DataTable columns={columns} data={items} isLoading={isLoading} />
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />
      <PurchaseReturnForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        purchaseOrders={purchaseOrders}
        warehouses={warehouses}
        products={products}
      />
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => {
          if (!o) setCancelTarget(null);
        }}
        title="Cancel Return"
        description={`Cancel return "${cancelTarget?.returnNumber}"?`}
        onConfirm={handleCancel}
        isLoading={isCancelling}
        confirmLabel="Cancel Return"
      />
    </div>
  );
}
