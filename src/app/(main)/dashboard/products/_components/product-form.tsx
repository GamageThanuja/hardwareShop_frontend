"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { unitOfMeasureLabels } from "@/lib/api/enum-labels";
import { CommonStatus, type ProductDto, UnitOfMeasure } from "@/lib/api/types";

const schema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: z.string().uuid("Select a category"),
  supplierId: z.string().optional(),
  unitPrice: z.coerce.number().min(0, "Must be ≥ 0"),
  costPrice: z.coerce.number().min(0, "Must be ≥ 0"),
  unit: z.coerce.number().int(),
  reorderLevel: z.coerce.number().int().min(0),
  reorderQuantity: z.coerce.number().int().min(0),
  status: z.coerce.number().int().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void>;
  defaultValues?: ProductDto | null;
  categories: { id: string; name: string | null }[];
  suppliers: { id: string; name: string | null }[];
  isLoading?: boolean;
}

export function ProductForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  categories,
  suppliers,
  isLoading,
}: ProductFormProps) {
  const isEdit = !!defaultValues;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      barcode: "",
      categoryId: "",
      supplierId: "",
      unitPrice: 0,
      costPrice: 0,
      unit: UnitOfMeasure.Piece,
      reorderLevel: 0,
      reorderQuantity: 0,
      status: CommonStatus.Active,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        sku: defaultValues.sku ?? "",
        name: defaultValues.name ?? "",
        description: defaultValues.description ?? "",
        barcode: defaultValues.barcode ?? "",
        categoryId: defaultValues.categoryId,
        supplierId: defaultValues.supplierId ?? "",
        unitPrice: defaultValues.unitPrice,
        costPrice: defaultValues.costPrice,
        unit: defaultValues.unit,
        reorderLevel: defaultValues.reorderLevel,
        reorderQuantity: defaultValues.reorderQuantity,
        status: defaultValues.status,
      });
    } else {
      form.reset();
    }
  }, [defaultValues, form]);

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FieldGroup className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Controller
              control={form.control}
              name="sku"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>SKU</FieldLabel>
                  <Input {...field} placeholder="HW-001" disabled={isEdit} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Barcode</FieldLabel>
                  <Input {...field} placeholder="Optional" />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
                  <FieldLabel>Name</FieldLabel>
                  <Input {...field} placeholder="Product name" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <Input {...field} placeholder="Optional description" />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Category</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
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
              name="supplierId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Supplier</FieldLabel>
                  <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="unitPrice"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Unit Price </FieldLabel>
                  <Input {...field} type="number" step="0.01" min="0" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="costPrice"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Cost Price </FieldLabel>
                  <Input {...field} type="number" step="0.01" min="0" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="unit"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Unit</FieldLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(unitOfMeasureLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Reorder Level</FieldLabel>
                  <Input {...field} type="number" min="0" />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="reorderQuantity"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Reorder Quantity</FieldLabel>
                  <Input {...field} type="number" min="0" />
                </Field>
              )}
            />
            {isEdit && (
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Active</SelectItem>
                        <SelectItem value="2">Inactive</SelectItem>
                        <SelectItem value="3">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            )}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
