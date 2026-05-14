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
import { commonStatusLabels, customerTypeLabels } from "@/lib/api/enum-labels";
import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from "@/lib/api/customers";
import { CommonStatus, CustomerType, type CustomerDto } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

const statusVariant: Record<CommonStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [CommonStatus.Active]: "default", [CommonStatus.Inactive]: "secondary",
  [CommonStatus.Archived]: "outline", [CommonStatus.Pending]: "secondary", [CommonStatus.Suspended]: "destructive",
};

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  customerType: z.coerce.number().int(),
  creditLimit: z.coerce.number().min(0),
  status: z.coerce.number().int().optional(),
});
type FormValues = z.infer<typeof schema>;

function CustomerForm({ open, onOpenChange, onSubmit, defaultValues, isLoading }: {
  open: boolean; onOpenChange: (o: boolean) => void; onSubmit: (v: FormValues) => Promise<void>;
  defaultValues: CustomerDto | null; isLoading?: boolean;
}) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) as Resolver<FormValues>, defaultValues: { firstName: "", lastName: "", email: "", phone: "", address: "", city: "", country: "", customerType: CustomerType.Retail, creditLimit: 0 } });

  useEffect(() => {
    if (defaultValues) {
      form.reset({ firstName: defaultValues.firstName ?? "", lastName: defaultValues.lastName ?? "", email: defaultValues.email ?? "", phone: defaultValues.phone ?? "", address: defaultValues.address ?? "", city: defaultValues.city ?? "", country: defaultValues.country ?? "", customerType: defaultValues.customerType, creditLimit: defaultValues.creditLimit, status: defaultValues.status });
    } else {
      form.reset({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "", country: "", customerType: CustomerType.Retail, creditLimit: 0 });
    }
  }, [defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{defaultValues ? "Edit Customer" : "New Customer"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(async (v) => { await onSubmit(v); form.reset(); })} className="space-y-4">
          <FieldGroup className="gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Controller control={form.control} name="firstName" render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}><FieldLabel>First Name *</FieldLabel><Input {...field} />{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
              )} />
              <Controller control={form.control} name="lastName" render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}><FieldLabel>Last Name *</FieldLabel><Input {...field} />{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller control={form.control} name="email" render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}><FieldLabel>Email</FieldLabel><Input {...field} type="email" />{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
              )} />
              <Controller control={form.control} name="phone" render={({ field }) => (
                <Field><FieldLabel>Phone</FieldLabel><Input {...field} /></Field>
              )} />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <Controller control={form.control} name="customerType" render={({ field }) => (
                <Field>
                  <FieldLabel>Customer Type</FieldLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Retail</SelectItem>
                      <SelectItem value="2">Wholesale</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )} />
              <Controller control={form.control} name="creditLimit" render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}><FieldLabel>Credit Limit</FieldLabel><Input {...field} type="number" min="0" step="0.01" />{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
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

export default function CustomersPage() {
  const [items, setItems] = useState<CustomerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listCustomers({ Page: page, PageSize: pageSize, Search: search || undefined });
      const d = res.data;
      setItems(d.items ?? []); setTotalCount(d.totalCount); setTotalPages(d.totalPages); setHasPrevious(d.hasPrevious); setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load customers.");
    } finally { setIsLoading(false); }
  }, [page, pageSize, search]);

  useEffect(() => { load(); }, [load]);

  const columns: ColumnDef<CustomerDto, unknown>[] = [
    { id: "fullName", header: "Name", cell: ({ row }) => `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim() || "—" },
    { accessorKey: "email", header: "Email", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    { accessorKey: "phone", header: "Phone", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    { accessorKey: "customerType", header: "Type", cell: ({ getValue }) => customerTypeLabels[getValue() as CustomerType] },
    { accessorKey: "creditLimit", header: "Credit Limit", cell: ({ getValue }) => formatCurrency(getValue() as number) },
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
        await updateCustomer(editTarget.id, { firstName: values.firstName, lastName: values.lastName, email: values.email || undefined, phone: values.phone, address: values.address, city: values.city, country: values.country, customerType: values.customerType as CustomerType, creditLimit: values.creditLimit, status: (values.status ?? CommonStatus.Active) as CommonStatus });
        toast.success("Customer updated.");
      } else {
        await createCustomer({ firstName: values.firstName, lastName: values.lastName, email: values.email || undefined, phone: values.phone, address: values.address, city: values.city, country: values.country, customerType: values.customerType as CustomerType, creditLimit: values.creditLimit });
        toast.success("Customer created.");
      }
      setFormOpen(false); setEditTarget(null); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save customer.");
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success("Customer deleted."); setDeleteTarget(null); load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete customer.");
    } finally { setIsDeleting(false); }
  };

  return (
    <div>
      <PageHeader title="Customers" description="Manage customer records" action={
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />New Customer</Button>
      } />
      <div className="flex gap-2 mb-4">
        <Input placeholder="Search customers…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      </div>
      <DataTable columns={columns} data={items} isLoading={isLoading} />
      <DataTablePagination page={page} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages} hasPrevious={hasPrevious} hasNext={hasNext} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
      <CustomerForm open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditTarget(null); }} onSubmit={handleSubmit} defaultValues={editTarget} isLoading={isSaving} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Delete Customer" description={`Delete "${editTarget?.firstName} ${editTarget?.lastName}"?`} onConfirm={handleDelete} isLoading={isDeleting} confirmLabel="Delete" />
    </div>
  );
}
