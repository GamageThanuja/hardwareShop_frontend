"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inventoryTransactionTypeLabels } from "@/lib/api/enum-labels";
import { getStockByWarehouse, listTransactions, transferStock } from "@/lib/api/stock";
import { listWarehouses } from "@/lib/api/warehouses";
import { listProducts } from "@/lib/api/products";
import { InventoryTransactionType, type InventoryTransactionDto, type StockItemDto, type WarehouseDto } from "@/lib/api/types";
import type { ColumnDef } from "@tanstack/react-table";

const stockColumns: ColumnDef<StockItemDto, unknown>[] = [
  { accessorKey: "productSKU", header: "SKU", cell: ({ getValue }) => <span className="font-mono text-xs">{(getValue() as string | null) ?? "—"}</span> },
  { accessorKey: "productName", header: "Product" },
  { accessorKey: "quantityOnHand", header: "On Hand" },
  { accessorKey: "quantityReserved", header: "Reserved" },
  { accessorKey: "quantityAvailable", header: "Available" },
];

const txColumns: ColumnDef<InventoryTransactionDto, unknown>[] = [
  { accessorKey: "createdAt", header: "Date", cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString() },
  { accessorKey: "productName", header: "Product" },
  { accessorKey: "warehouseName", header: "Warehouse" },
  { accessorKey: "transactionType", header: "Type", cell: ({ getValue }) => inventoryTransactionTypeLabels[getValue() as InventoryTransactionType] ?? "—" },
  { accessorKey: "quantity", header: "Qty" },
  { accessorKey: "notes", header: "Notes", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
];

const transferSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  fromWarehouseId: z.string().min(1, "From warehouse is required"),
  toWarehouseId: z.string().min(1, "To warehouse is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
});
type TransferFormValues = z.infer<typeof transferSchema>;

function StockByWarehouse({ warehouses }: { warehouses: WarehouseDto[] }) {
  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState<StockItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const load = useCallback(async () => {
    if (!warehouseId) return;
    setIsLoading(true);
    try {
      const res = await getStockByWarehouse(warehouseId, { Page: page, PageSize: pageSize });
      const d = res.data;
      setItems(d.items ?? []);
      setTotalCount(d.totalCount); setTotalPages(d.totalPages); setHasPrevious(d.hasPrevious); setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load stock.");
    } finally { setIsLoading(false); }
  }, [warehouseId, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <Select value={warehouseId} onValueChange={(v) => { setWarehouseId(v); setPage(1); }}>
        <SelectTrigger className="max-w-xs"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
        <SelectContent>
          {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {warehouseId && (
        <>
          <DataTable columns={stockColumns} data={items} isLoading={isLoading} />
          <DataTablePagination page={page} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages} hasPrevious={hasPrevious} hasNext={hasNext} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
        </>
      )}
      {!warehouseId && <p className="text-muted-foreground text-sm">Select a warehouse to view its stock.</p>}
    </div>
  );
}

function Transactions({ warehouses, products }: { warehouses: WarehouseDto[]; products: { id: string; name: string | null }[] }) {
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [items, setItems] = useState<InventoryTransactionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listTransactions({
        Page: page, PageSize: pageSize,
        warehouseId: warehouseId || undefined,
        productId: productId || undefined,
      });
      const d = res.data;
      setItems(d.items ?? []);
      setTotalCount(d.totalCount); setTotalPages(d.totalPages); setHasPrevious(d.hasPrevious); setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load transactions.");
    } finally { setIsLoading(false); }
  }, [page, pageSize, warehouseId, productId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Select value={warehouseId} onValueChange={(v) => { setWarehouseId(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All warehouses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All warehouses</SelectItem>
            {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={productId} onValueChange={(v) => { setProductId(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All products" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={txColumns} data={items} isLoading={isLoading} />
      <DataTablePagination page={page} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages} hasPrevious={hasPrevious} hasNext={hasNext} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
    </div>
  );
}

function Transfer({ warehouses, products }: { warehouses: WarehouseDto[]; products: { id: string; name: string | null }[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema) as Resolver<TransferFormValues>,
    defaultValues: { productId: "", fromWarehouseId: "", toWarehouseId: "", quantity: 1, notes: "" },
  });

  const handleSubmit = async (values: TransferFormValues) => {
    setIsLoading(true);
    try {
      await transferStock({ productId: values.productId, fromWarehouseId: values.fromWarehouseId, toWarehouseId: values.toWarehouseId, quantity: values.quantity, notes: values.notes || undefined });
      toast.success("Stock transferred successfully.");
      form.reset({ productId: "", fromWarehouseId: "", toWarehouseId: "", quantity: 1, notes: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to transfer stock.");
    } finally { setIsLoading(false); }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-md space-y-4">
      <FieldGroup className="gap-4">
        <Controller control={form.control} name="productId" render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Product *</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
        <Controller control={form.control} name="fromWarehouseId" render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>From Warehouse *</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
        <Controller control={form.control} name="toWarehouseId" render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>To Warehouse *</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
        <Controller control={form.control} name="quantity" render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Quantity *</FieldLabel>
            <Input {...field} type="number" min="1" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
        <Controller control={form.control} name="notes" render={({ field }) => (
          <Field><FieldLabel>Notes</FieldLabel><Input {...field} placeholder="Optional" /></Field>
        )} />
      </FieldGroup>
      <Button type="submit" disabled={isLoading}>{isLoading ? "Transferring…" : "Transfer Stock"}</Button>
    </form>
  );
}

export default function StockPage() {
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string | null }[]>([]);

  useEffect(() => {
    listWarehouses({ PageSize: 200 })
      .then((r) => setWarehouses(r.data.items ?? []))
      .catch(() => {});
    listProducts({ PageSize: 500 })
      .then((r) => setProducts(r.data.items?.map((p) => ({ id: p.id, name: p.name })) ?? []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Stock" description="View and manage inventory stock levels" />
      <Tabs defaultValue="warehouse">
        <TabsList className="mb-4">
          <TabsTrigger value="warehouse">By Warehouse</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>
        <TabsContent value="warehouse">
          <StockByWarehouse warehouses={warehouses} />
        </TabsContent>
        <TabsContent value="transactions">
          <Transactions warehouses={warehouses} products={products} />
        </TabsContent>
        <TabsContent value="transfer">
          <Transfer warehouses={warehouses} products={products} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
