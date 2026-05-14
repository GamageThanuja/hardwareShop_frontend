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
import { createSupplier, deleteSupplier, listSuppliers, updateSupplier } from "@/lib/api/suppliers";
import { CommonStatus, type SupplierDto } from "@/lib/api/types";
import type { ColumnDef } from "@tanstack/react-table";

const statusVariant: Record<CommonStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [CommonStatus.Active]: "default", [CommonStatus.Inactive]: "secondary",
  [CommonStatus.Archived]: "outline", [CommonStatus.Pending]: "secondary", [CommonStatus.Suspended]: "destructive",
};

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  status: z.coerce.number().int().optional(),
});
type FormValues = z.infer<typeof schema>;

function SupplierForm({ open, onOpenChange, onSubmit, defaultValues, isLoading }: {
  open: boolean; onOpenChange: (o: boolean) => void; onSubmit: (v: FormValues) => Promise<void>;
  defaultValues: SupplierDto | null; isLoading?: boolean;
}) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) as Resolver<FormValues>, defaultValues: { name: "", contactName: "", email: "", phone: "", address: "", city: "", country: "" } });

  useEffect(() => {
    if (defaultValues) {
      form.reset({ name: defaultValues.name ?? "", contactName: defaultValues.contactName ?? "", email: defaultValues.email ?? "", phone: defaultValues.phone ?? "", address: defaultValues.address ?? "", city: defaultValues.city ?? "", country: defaultValues.country ?? "", status: defaultValues.status });
    } else {
      form.reset({ name: "", contactName: "", email: "", phone: "", address: "", city: "", country: "" });
    }
  }, [defaultValues, form]);

  const fields: { name: keyof FormValues; label: string; placeholder?: string }[] = [
    { name: "name", label: "Name *" }, { name: "contactName", label: "Contact Name" },
    { name: "email", label: "Email", placeholder: "contact@supplier.com" }, { name: "phone", label: "Phone" },
    { name: "address", label: "Address" }, { name: "city", label: "City" }, { name: "country", label: "Country" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{defaultValues ? "Edit Supplier" : "New Supplier"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(async (v) => { await onSubmit(v); form.reset(); })} className="space-y-4">
          <FieldGroup className="gap-3">
            {fields.map((f) => (
              <Controller key={f.name} control={form.control} name={f.name} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{f.label}</FieldLabel>
                  <Input {...field} value={field.value as string ?? ""} placeholder={f.placeholder} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />
            ))}
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

export default function SuppliersPage() {
  const [items, setItems] = useState<SupplierDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SupplierDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplierDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listSuppliers({ Page: page, PageSize: pageSize, Search: search || undefined });
      const d = res.data;
      setItems(d.items ?? []);
      setTotalCount(d.totalCount); setTotalPages(d.totalPages); setHasPrevious(d.hasPrevious); setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load suppliers.");
    } finally { setIsLoading(false); }
  }, [page, pageSize, search]);

  useEffect(() => { load(); }, [load]);

  const columns: ColumnDef<SupplierDto, unknown>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "contactName", header: "Contact", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    { accessorKey: "email", header: "Email", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    { accessorKey: "phone", header: "Phone", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
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
        await updateSupplier(editTarget.id, { name: values.name!, contactName: values.contactName, email: values.email || undefined, phone: values.phone, address: values.address, city: values.city, country: values.country, status: (values.status ?? CommonStatus.Active) as CommonStatus });
        toast.success("Supplier updated.");
      } else {
        await createSupplier({ name: values.name!, contactName: values.contactName, email: values.email || undefined, phone: values.phone, address: values.address, city: values.city, country: values.country });
        toast.success("Supplier created.");
      }
      setFormOpen(false); setEditTarget(null); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save supplier.");
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSupplier(deleteTarget.id);
      toast.success("Supplier deleted."); setDeleteTarget(null); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete supplier.");
    } finally { setIsDeleting(false); }
  };

  return (
    <div>
      <PageHeader title="Suppliers" description="Manage supplier information" action={
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />New Supplier</Button>
      } />
      <div className="flex gap-2 mb-4">
        <Input placeholder="Search suppliers…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      </div>
      <DataTable columns={columns} data={items} isLoading={isLoading} />
      <DataTablePagination page={page} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages} hasPrevious={hasPrevious} hasNext={hasNext} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
      <SupplierForm open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditTarget(null); }} onSubmit={handleSubmit} defaultValues={editTarget} isLoading={isSaving} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Delete Supplier" description={`Delete "${deleteTarget?.name}"?`} onConfirm={handleDelete} isLoading={isDeleting} confirmLabel="Delete" />
    </div>
  );
}
