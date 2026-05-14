"use client";

import { useCallback, useEffect, useState } from "react";

import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";
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
import { commonStatusLabels } from "@/lib/api/enum-labels";
import { createWarehouse, deleteWarehouse, listWarehouses, updateWarehouse } from "@/lib/api/warehouses";
import { CommonStatus, type WarehouseDto } from "@/lib/api/types";
import type { ColumnDef } from "@tanstack/react-table";

const statusVariant: Record<CommonStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [CommonStatus.Active]: "default", [CommonStatus.Inactive]: "secondary",
  [CommonStatus.Archived]: "outline", [CommonStatus.Pending]: "secondary", [CommonStatus.Suspended]: "destructive",
};

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  status: z.coerce.number().int().optional(),
});
type FormValues = z.infer<typeof schema>;

function WarehouseForm({ open, onOpenChange, onSubmit, defaultValues, isLoading }: {
  open: boolean; onOpenChange: (o: boolean) => void; onSubmit: (v: FormValues) => Promise<void>;
  defaultValues: WarehouseDto | null; isLoading?: boolean;
}) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) as Resolver<FormValues>, defaultValues: { name: "", address: "", city: "", country: "" } });

  useEffect(() => {
    if (defaultValues) {
      form.reset({ name: defaultValues.name ?? "", address: defaultValues.address ?? "", city: defaultValues.city ?? "", country: defaultValues.country ?? "", status: defaultValues.status });
    } else {
      form.reset({ name: "", address: "", city: "", country: "" });
    }
  }, [defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{defaultValues ? "Edit Warehouse" : "New Warehouse"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(async (v) => { await onSubmit(v); form.reset(); })} className="space-y-4">
          <FieldGroup className="gap-3">
            <Controller control={form.control} name="name" render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Name *</FieldLabel>
                <Input {...field} placeholder="Warehouse name" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )} />
            <Controller control={form.control} name="address" render={({ field }) => (
              <Field><FieldLabel>Address</FieldLabel><Input {...field} /></Field>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <Controller control={form.control} name="city" render={({ field }) => (
                <Field><FieldLabel>City</FieldLabel><Input {...field} /></Field>
              )} />
              <Controller control={form.control} name="country" render={({ field }) => (
                <Field><FieldLabel>Country</FieldLabel><Input {...field} /></Field>
              )} />
            </div>
            {defaultValues && (
              <Controller control={form.control} name="status" render={({ field }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="2">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )} />
            )}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving…" : defaultValues ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function WarehousesPage() {
  const [items, setItems] = useState<WarehouseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WarehouseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WarehouseDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listWarehouses({ Page: page, PageSize: pageSize, Search: search || undefined });
      const d = res.data;
      setItems(d.items ?? []);
      setTotalCount(d.totalCount); setTotalPages(d.totalPages); setHasPrevious(d.hasPrevious); setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load warehouses.");
    } finally { setIsLoading(false); }
  }, [page, pageSize, search]);

  useEffect(() => { load(); }, [load]);

  const columns: ColumnDef<WarehouseDto, unknown>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "address", header: "Address", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    { accessorKey: "city", header: "City", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    { accessorKey: "country", header: "Country", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => {
      const s = getValue() as CommonStatus;
      return <Badge variant={statusVariant[s]}>{commonStatusLabels[s]}</Badge>;
    }},
    { id: "actions", header: "", cell: ({ row }) => (
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={() => { setEditTarget(row.original); setFormOpen(true); }}>Edit</Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(row.original)}>Delete</Button>
      </div>
    )},
  ];

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      if (editTarget) {
        await updateWarehouse(editTarget.id, { name: values.name, address: values.address, city: values.city, country: values.country, status: (values.status ?? CommonStatus.Active) as CommonStatus });
        toast.success("Warehouse updated.");
      } else {
        await createWarehouse({ name: values.name, address: values.address, city: values.city, country: values.country });
        toast.success("Warehouse created.");
      }
      setFormOpen(false); setEditTarget(null); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save warehouse.");
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteWarehouse(deleteTarget.id);
      toast.success("Warehouse deleted."); setDeleteTarget(null); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete warehouse.");
    } finally { setIsDeleting(false); }
  };

  return (
    <div>
      <PageHeader title="Warehouses" description="Manage warehouse locations" action={
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />New Warehouse</Button>
      } />
      <div className="flex gap-2 mb-4">
        <Input placeholder="Search warehouses…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      </div>
      <DataTable columns={columns} data={items} isLoading={isLoading} />
      <DataTablePagination page={page} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages} hasPrevious={hasPrevious} hasNext={hasNext} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
      <WarehouseForm open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditTarget(null); }} onSubmit={handleSubmit} defaultValues={editTarget} isLoading={isSaving} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Delete Warehouse" description={`Delete "${deleteTarget?.name}"?`} onConfirm={handleDelete} isLoading={isDeleting} confirmLabel="Delete" />
    </div>
  );
}
