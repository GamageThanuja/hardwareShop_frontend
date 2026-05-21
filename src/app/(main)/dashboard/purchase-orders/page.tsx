"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { purchaseOrderStatusLabels } from "@/lib/api/enum-labels";
import { listProducts } from "@/lib/api/products";
import { createPurchaseOrder, deletePurchaseOrder, listPurchaseOrders } from "@/lib/api/purchase-orders";
import { listSuppliers } from "@/lib/api/suppliers";
import { type PurchaseOrderDto, PurchaseOrderStatus, type SupplierDto } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

const statusVariant: Record<PurchaseOrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [PurchaseOrderStatus.Draft]: "secondary",
  [PurchaseOrderStatus.Pending]: "secondary",
  [PurchaseOrderStatus.Ordered]: "default",
  [PurchaseOrderStatus.Received]: "default",
  [PurchaseOrderStatus.Cancelled]: "destructive",
};

const itemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Min 1"),
  unitCost: z.coerce.number().min(0, "Min 0"),
});

const schema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});
type FormValues = z.infer<typeof schema>;

function PurchaseOrderForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  suppliers,
  products,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: FormValues) => Promise<void>;
  isLoading?: boolean;
  suppliers: SupplierDto[];
  products: { id: string; name: string | null; sku: string | null }[];
}) {
  const today = new Date().toISOString().split("T")[0];
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      supplierId: "",
      orderDate: today,
      expectedDeliveryDate: "",
      notes: "",
      items: [{ productId: "", quantity: 1, unitCost: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (!open)
      form.reset({
        supplierId: "",
        orderDate: today,
        expectedDeliveryDate: "",
        notes: "",
        items: [{ productId: "", quantity: 1, unitCost: 0 }],
      });
  }, [open, form, today]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Purchase Order</DialogTitle>
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
                name="supplierId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Supplier *</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
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
                name="orderDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Order Date *</FieldLabel>
                    <Input {...field} type="date" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="expectedDeliveryDate"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Expected Delivery</FieldLabel>
                    <Input {...field} type="date" />
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
                <div key={f.id} className="grid grid-cols-[1fr_80px_100px_32px] items-end gap-2">
                  <Controller
                    control={form.control}
                    name={`items.${i}.productId`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
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
                    name={`items.${i}.unitCost`}
                    render={({ field }) => (
                      <Field>
                        {i === 0 && <FieldLabel className="text-muted-foreground text-xs">Unit Cost</FieldLabel>}
                        <Input {...field} type="number" step="0.01" min="0" />
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
                onClick={() => append({ productId: "", quantity: 1, unitCost: 0 })}
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
              {isLoading ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [items, setItems] = useState<PurchaseOrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrderDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string | null; sku: string | null }[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listPurchaseOrders({ Page: page, PageSize: pageSize, Search: search || undefined });
      const d = res.data;
      setItems(d.items ?? []);
      setTotalCount(d.totalCount);
      setTotalPages(d.totalPages);
      setHasPrevious(d.hasPrevious);
      setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load purchase orders.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    listSuppliers({ PageSize: 200 })
      .then((r) => setSuppliers(r.data.items ?? []))
      .catch(() => {
        /* noop */
      });
    listProducts({ PageSize: 500 })
      .then((r) => setProducts(r.data.items?.map((p) => ({ id: p.id, name: p.name, sku: p.sku })) ?? []))
      .catch(() => {
        /* noop */
      });
  }, []);

  const columns: ColumnDef<PurchaseOrderDto, unknown>[] = [
    {
      accessorKey: "poNumber",
      header: "PO #",
      cell: ({ getValue, row }) => (
        <Link
          href={`/dashboard/purchase-orders/${row.original.id}`}
          className="font-mono text-primary text-xs hover:underline"
        >
          {(getValue() as string | null) ?? row.original.id.slice(0, 8)}
        </Link>
      ),
    },
    { accessorKey: "supplierName", header: "Supplier", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "expectedDeliveryDate",
      header: "Expected Delivery",
      cell: ({ getValue }) =>
        (getValue() as string | null) ? new Date(getValue() as string).toLocaleDateString() : "—",
    },
    { accessorKey: "totalAmount", header: "Total", cell: ({ getValue }) => formatCurrency(getValue() as number) },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const s = getValue() as PurchaseOrderStatus;
        return <Badge variant={statusVariant[s]}>{purchaseOrderStatusLabels[s]}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <RowActions
          actions={[
            { label: "View", onClick: () => router.push(`/dashboard/purchase-orders/${row.original.id}`) },
            { label: "Delete", onClick: () => setDeleteTarget(row.original), destructive: true, separator: true },
          ]}
        />
      ),
    },
  ];

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      await createPurchaseOrder({
        supplierId: values.supplierId,
        orderDate: values.orderDate,
        expectedDeliveryDate: values.expectedDeliveryDate || undefined,
        notes: values.notes || undefined,
        items: values.items,
      });
      toast.success("Purchase order created.");
      setFormOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create purchase order.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePurchaseOrder(deleteTarget.id);
      toast.success("Purchase order deleted.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete purchase order.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders from suppliers"
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Button>
        }
      />
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search purchase orders…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>
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
      <PurchaseOrderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        suppliers={suppliers}
        products={products}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title="Delete Purchase Order"
        description={`Delete PO "${deleteTarget?.poNumber}"?`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmLabel="Delete"
      />
    </div>
  );
}
