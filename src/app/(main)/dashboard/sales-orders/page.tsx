"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentStatusLabels, salesOrderStatusLabels } from "@/lib/api/enum-labels";
import { createSalesOrder, deleteSalesOrder, listSalesOrders } from "@/lib/api/sales-orders";
import { listCustomers } from "@/lib/api/customers";
import { listProducts } from "@/lib/api/products";
import { PaymentStatus, SalesOrderStatus, type CustomerDto, type SalesOrderDto } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

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

const itemSchema = z.object({
  productId: z.string().min(1, "Required"),
  quantity: z.coerce.number().int().min(1, "Min 1"),
  unitPrice: z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).max(100),
  taxPercent: z.coerce.number().min(0).max(100),
});

const schema = z.object({
  customerId: z.string().optional(),
  orderDate: z.string().min(1, "Order date is required"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});
type FormValues = z.infer<typeof schema>;

function SalesOrderForm({ open, onOpenChange, onSubmit, isLoading, customers, products }: {
  open: boolean; onOpenChange: (o: boolean) => void; onSubmit: (v: FormValues) => Promise<void>;
  isLoading?: boolean; customers: CustomerDto[]; products: { id: string; name: string | null; sku: string | null; unitPrice: number }[];
}) {
  const today = new Date().toISOString().split("T")[0];
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { customerId: "", orderDate: today, notes: "", items: [{ productId: "", quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (!open) form.reset({ customerId: "", orderDate: today, notes: "", items: [{ productId: "", quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 }] });
  }, [open, form, today]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New Sales Order</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(async (v) => { await onSubmit(v); })} className="space-y-4">
          <FieldGroup className="gap-4">
            <div className="grid grid-cols-3 gap-4">
              <Controller control={form.control} name="customerId" render={({ field }) => (
                <Field>
                  <FieldLabel>Customer</FieldLabel>
                  <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Walk-in / Anonymous" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Walk-in</SelectItem>
                      {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              )} />
              <Controller control={form.control} name="orderDate" render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Order Date *</FieldLabel>
                  <Input {...field} type="date" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />
              <Controller control={form.control} name="notes" render={({ field }) => (
                <Field><FieldLabel>Notes</FieldLabel><Input {...field} /></Field>
              )} />
            </div>
            <div className="space-y-2">
              <FieldLabel>Items *</FieldLabel>
              {fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-[1fr_60px_90px_70px_70px_32px] gap-2 items-end">
                  <Controller control={form.control} name={`items.${i}.productId`} render={({ field }) => (
                    <Field>
                      {i === 0 && <FieldLabel className="text-xs text-muted-foreground">Product</FieldLabel>}
                      <Select value={field.value} onValueChange={(v) => {
                        field.onChange(v);
                        const p = products.find((x) => x.id === v);
                        if (p) form.setValue(`items.${i}.unitPrice`, p.unitPrice);
                      }}>
                        <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                        <SelectContent>
                          {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.sku ? `[${p.sku}] ` : ""}{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                  )} />
                  <Controller control={form.control} name={`items.${i}.quantity`} render={({ field }) => (
                    <Field>
                      {i === 0 && <FieldLabel className="text-xs text-muted-foreground">Qty</FieldLabel>}
                      <Input {...field} type="number" min="1" />
                    </Field>
                  )} />
                  <Controller control={form.control} name={`items.${i}.unitPrice`} render={({ field }) => (
                    <Field>
                      {i === 0 && <FieldLabel className="text-xs text-muted-foreground">Price</FieldLabel>}
                      <Input {...field} type="number" step="0.01" min="0" />
                    </Field>
                  )} />
                  <Controller control={form.control} name={`items.${i}.discountPercent`} render={({ field }) => (
                    <Field>
                      {i === 0 && <FieldLabel className="text-xs text-muted-foreground">Disc %</FieldLabel>}
                      <Input {...field} type="number" min="0" max="100" />
                    </Field>
                  )} />
                  <Controller control={form.control} name={`items.${i}.taxPercent`} render={({ field }) => (
                    <Field>
                      {i === 0 && <FieldLabel className="text-xs text-muted-foreground">Tax %</FieldLabel>}
                      <Input {...field} type="number" min="0" max="100" />
                    </Field>
                  )} />
                  <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => remove(i)} disabled={fields.length === 1}>✕</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 })}>
                <Plus className="h-3 w-3 mr-1" />Add Item
              </Button>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving…" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SalesOrdersPage() {
  const [items, setItems] = useState<SalesOrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SalesOrderDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string | null; sku: string | null; unitPrice: number }[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listSalesOrders({ Page: page, PageSize: pageSize, Search: search || undefined });
      const d = res.data;
      setItems(d.items ?? []);
      setTotalCount(d.totalCount); setTotalPages(d.totalPages); setHasPrevious(d.hasPrevious); setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load sales orders.");
    } finally { setIsLoading(false); }
  }, [page, pageSize, search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    listCustomers({ PageSize: 500 }).then((r) => setCustomers(r.data.items ?? [])).catch(() => {});
    listProducts({ PageSize: 500 }).then((r) => setProducts(r.data.items?.map((p) => ({ id: p.id, name: p.name, sku: p.sku, unitPrice: p.unitPrice })) ?? [])).catch(() => {});
  }, []);

  const columns: ColumnDef<SalesOrderDto, unknown>[] = [
    { accessorKey: "orderNumber", header: "Order #", cell: ({ getValue, row }) => (
      <Link href={`/dashboard/sales-orders/${row.original.id}`} className="font-mono text-xs hover:underline text-primary">
        {(getValue() as string | null) ?? row.original.id.slice(0, 8)}
      </Link>
    )},
    { accessorKey: "customerName", header: "Customer", cell: ({ getValue }) => (getValue() as string | null) ?? "Walk-in" },
    { accessorKey: "orderDate", header: "Date", cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString() },
    { accessorKey: "grandTotal", header: "Total", cell: ({ getValue }) => formatCurrency(getValue() as number) },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => {
      const s = getValue() as SalesOrderStatus;
      return <Badge variant={statusVariant[s]}>{salesOrderStatusLabels[s]}</Badge>;
    }},
    { accessorKey: "paymentStatus", header: "Payment", cell: ({ getValue }) => {
      const s = getValue() as PaymentStatus;
      return <Badge variant={paymentStatusVariant[s]}>{paymentStatusLabels[s]}</Badge>;
    }},
    { accessorKey: "balance", header: "Balance", cell: ({ getValue }) => {
      const v = getValue() as number;
      return <span className={v > 0 ? "text-destructive" : ""}>{formatCurrency(v)}</span>;
    }},
    { id: "actions", header: "", cell: ({ row }) => (
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" asChild><Link href={`/dashboard/sales-orders/${row.original.id}`}>View</Link></Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(row.original)}>Delete</Button>
      </div>
    )},
  ];

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      await createSalesOrder({
        customerId: values.customerId || undefined,
        orderDate: values.orderDate,
        notes: values.notes || undefined,
        items: values.items,
      });
      toast.success("Sales order created.");
      setFormOpen(false); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create sales order.");
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSalesOrder(deleteTarget.id);
      toast.success("Sales order deleted."); setDeleteTarget(null); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete sales order.");
    } finally { setIsDeleting(false); }
  };

  return (
    <div>
      <PageHeader title="Sales Orders" description="Manage customer sales orders" action={
        <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4 mr-2" />New Sales Order</Button>
      } />
      <div className="flex gap-2 mb-4">
        <Input placeholder="Search sales orders…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      </div>
      <DataTable columns={columns} data={items} isLoading={isLoading} />
      <DataTablePagination page={page} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages} hasPrevious={hasPrevious} hasNext={hasNext} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
      <SalesOrderForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleSubmit} isLoading={isSaving} customers={customers} products={products} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Delete Sales Order" description={`Delete order "${deleteTarget?.orderNumber}"?`} onConfirm={handleDelete} isLoading={isDeleting} confirmLabel="Delete" />
    </div>
  );
}
