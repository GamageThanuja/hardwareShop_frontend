"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { paymentMethodLabels } from "@/lib/api/enum-labels";
import { listPayments, recordPayment, voidPayment } from "@/lib/api/payments";
import { listSalesOrders } from "@/lib/api/sales-orders";
import { type PaymentDto, PaymentMethod, type SalesOrderDto } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  salesOrderId: z.string().min(1, "Sales order is required"),
  amount: z.coerce.number().min(0.01, "Amount must be > 0"),
  method: z.coerce.number().int(),
  paymentDate: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const voidSchema = z.object({ reason: z.string().optional() });
type VoidFormValues = z.infer<typeof voidSchema>;

function RecordPaymentForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  salesOrders,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: FormValues) => Promise<void>;
  isLoading?: boolean;
  salesOrders: SalesOrderDto[];
}) {
  const today = new Date().toISOString().split("T")[0];
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      salesOrderId: "",
      amount: 0,
      method: PaymentMethod.Cash,
      paymentDate: today,
      referenceNumber: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open)
      form.reset({
        salesOrderId: "",
        amount: 0,
        method: PaymentMethod.Cash,
        paymentDate: today,
        referenceNumber: "",
        notes: "",
      });
  }, [open, form, today]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(async (v) => {
            await onSubmit(v);
          })}
          className="space-y-4"
        >
          <FieldGroup className="gap-3">
            <Controller
              control={form.control}
              name="salesOrderId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Sales Order *</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesOrders.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.orderNumber ?? o.id.slice(0, 8)} — {formatCurrency(o.balance)} due
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="amount"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Amount *</FieldLabel>
                    <Input {...field} type="number" step="0.01" min="0.01" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="method"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Method</FieldLabel>
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(paymentMethodLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Payment Date</FieldLabel>
                    <Input {...field} type="date" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Reference #</FieldLabel>
                    <Input {...field} />
                  </Field>
                )}
              />
            </div>
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
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VoidDialog({
  open,
  onOpenChange,
  payment,
  onVoid,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  payment: PaymentDto | null;
  onVoid: (reason?: string) => Promise<void>;
  isLoading?: boolean;
}) {
  const form = useForm<VoidFormValues>({ resolver: zodResolver(voidSchema), defaultValues: { reason: "" } });
  useEffect(() => {
    if (!open) form.reset({ reason: "" });
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Void Payment</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Void payment of {payment ? formatCurrency(payment.amount) : ""}?
        </p>
        <form
          onSubmit={form.handleSubmit(async (v) => {
            await onVoid(v.reason || undefined);
          })}
          className="space-y-4"
        >
          <Controller
            control={form.control}
            name="reason"
            render={({ field }) => (
              <Field>
                <FieldLabel>Reason (optional)</FieldLabel>
                <Input {...field} />
              </Field>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? "Voiding…" : "Void Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PaymentsPage() {
  const [items, setItems] = useState<PaymentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState<PaymentDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [salesOrders, setSalesOrders] = useState<SalesOrderDto[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listPayments({ Page: page, PageSize: pageSize });
      const d = res.data;
      setItems(d.items ?? []);
      setTotalCount(d.totalCount);
      setTotalPages(d.totalPages);
      setHasPrevious(d.hasPrevious);
      setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    listSalesOrders({ PageSize: 500 })
      .then((r) => setSalesOrders(r.data.items ?? []))
      .catch(() => {
        /* noop */
      });
  }, []);

  const columns: ColumnDef<PaymentDto, unknown>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ getValue }) => <span className="font-mono text-xs">{(getValue() as string | null) ?? "—"}</span>,
    },
    {
      accessorKey: "paymentDate",
      header: "Date",
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    { accessorKey: "amount", header: "Amount", cell: ({ getValue }) => formatCurrency(getValue() as number) },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ getValue }) => paymentMethodLabels[getValue() as PaymentMethod],
    },
    {
      accessorKey: "referenceNumber",
      header: "Reference",
      cell: ({ getValue }) => (getValue() as string | null) ?? "—",
    },
    {
      accessorKey: "isVoided",
      header: "Status",
      cell: ({ getValue }) => {
        const voided = getValue() as boolean;
        return <Badge variant={voided ? "destructive" : "default"}>{voided ? "Voided" : "Active"}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <RowActions
          actions={[
            ...(!row.original.isVoided
              ? [{ label: "Void", onClick: () => setVoidTarget(row.original), destructive: true }]
              : []),
          ]}
        />
      ),
    },
  ];

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      await recordPayment({
        salesOrderId: values.salesOrderId,
        amount: values.amount,
        method: values.method as PaymentMethod,
        paymentDate: values.paymentDate || undefined,
        referenceNumber: values.referenceNumber || undefined,
        notes: values.notes || undefined,
      });
      toast.success("Payment recorded.");
      setFormOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoid = async (reason?: string) => {
    if (!voidTarget) return;
    setIsVoiding(true);
    try {
      await voidPayment(voidTarget.id, { reason });
      toast.success("Payment voided.");
      setVoidTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to void payment.");
    } finally {
      setIsVoiding(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Manage customer payments"
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
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
      <RecordPaymentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        salesOrders={salesOrders}
      />
      <VoidDialog
        open={!!voidTarget}
        onOpenChange={(o) => {
          if (!o) setVoidTarget(null);
        }}
        payment={voidTarget}
        onVoid={handleVoid}
        isLoading={isVoiding}
      />
    </div>
  );
}
