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
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/api/categories";
import { CommonStatus, type CategoryDto } from "@/lib/api/types";
import type { ColumnDef } from "@tanstack/react-table";

const statusVariant: Record<CommonStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [CommonStatus.Active]: "default",
  [CommonStatus.Inactive]: "secondary",
  [CommonStatus.Archived]: "outline",
  [CommonStatus.Pending]: "secondary",
  [CommonStatus.Suspended]: "destructive",
};

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parentCategoryId: z.string().optional(),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

function CategoryForm({
  open, onOpenChange, onSubmit, defaultValues, categories, isLoading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: FormValues) => Promise<void>;
  defaultValues: CategoryDto | null;
  categories: CategoryDto[];
  isLoading?: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: "", description: "", parentCategoryId: "", status: CommonStatus.Active },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name ?? "",
        description: defaultValues.description ?? "",
        parentCategoryId: defaultValues.parentCategoryId ?? "",
        status: defaultValues.status,
      });
    } else {
      form.reset({ name: "", description: "", parentCategoryId: "", status: CommonStatus.Active });
    }
  }, [defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{defaultValues ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(async (v) => { await onSubmit(v); form.reset(); })} className="space-y-4">
          <FieldGroup className="gap-4">
            <Controller control={form.control} name="name" render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Name </FieldLabel>
                <Input {...field} placeholder="Category name" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )} />
            <Controller control={form.control} name="description" render={({ field }) => (
              <Field><FieldLabel>Description</FieldLabel><Input {...field} placeholder="Optional" /></Field>
            )} />
            <Controller control={form.control} name="parentCategoryId" render={({ field }) => (
              <Field>
                <FieldLabel>Parent Category</FieldLabel>
                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.filter((c) => c.id !== defaultValues?.id).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )} />
            {defaultValues && (
              <Controller control={form.control} name="status" render={({ field }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="2">Inactive</SelectItem>
                      <SelectItem value="3">Archived</SelectItem>
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

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allCategories, setAllCategories] = useState<CategoryDto[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listCategories({ Page: page, PageSize: pageSize, Search: search || undefined });
      const d = res.data;
      setItems(d.items ?? []);
      setTotalCount(d.totalCount);
      setTotalPages(d.totalPages);
      setHasPrevious(d.hasPrevious);
      setHasNext(d.hasNext);
      setAllCategories(d.items ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => { load(); }, [load]);

  const columns: ColumnDef<CategoryDto, unknown>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "description", header: "Description", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    { accessorKey: "parentCategoryName", header: "Parent", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
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
        await updateCategory(editTarget.id, {
          name: values.name,
          description: values.description,
          parentCategoryId: values.parentCategoryId || undefined,
          status: values.status as CommonStatus,
        });
        toast.success("Category updated.");
      } else {
        await createCategory({
          name: values.name,
          description: values.description,
          parentCategoryId: values.parentCategoryId || undefined,
          status: CommonStatus.Active,
        });
        toast.success("Category created.");
      }
      setFormOpen(false);
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("Category deleted.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage product categories"
        action={
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />New Category
          </Button>
        }
      />
      <div className="flex gap-2 mb-4">
        <Input placeholder="Search categories…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
      </div>
      <DataTable columns={columns} data={items} isLoading={isLoading} />
      <DataTablePagination page={page} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages} hasPrevious={hasPrevious} hasNext={hasNext} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
      <CategoryForm open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditTarget(null); }} onSubmit={handleSubmit} defaultValues={editTarget} categories={allCategories} isLoading={isSaving} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Delete Category" description={`Delete "${deleteTarget?.name}"?`} onConfirm={handleDelete} isLoading={isDeleting} confirmLabel="Delete" />
    </div>
  );
}
