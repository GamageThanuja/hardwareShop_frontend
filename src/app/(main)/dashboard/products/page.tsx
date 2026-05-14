"use client";

import { useCallback, useEffect, useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listCategories } from "@/lib/api/categories";
import { commonStatusLabels, unitOfMeasureLabels } from "@/lib/api/enum-labels";
import { createProduct, deleteProduct, listProducts, updateProduct } from "@/lib/api/products";
import { listSuppliers } from "@/lib/api/suppliers";
import { CommonStatus, type ProductDto, type UnitOfMeasure } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

import { ProductForm } from "./_components/product-form";

const productCurrency = {
  currency: "LKR",
  locale: "en-LK",
} as const;

const statusVariant: Record<CommonStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [CommonStatus.Active]: "default",
  [CommonStatus.Inactive]: "secondary",
  [CommonStatus.Archived]: "outline",
  [CommonStatus.Pending]: "secondary",
  [CommonStatus.Suspended]: "destructive",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [categories, setCategories] = useState<{ id: string; name: string | null }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string | null }[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listProducts({ Page: page, PageSize: pageSize, Search: search || undefined });
      const d = res.data;
      setProducts(d.items ?? []);
      setTotalCount(d.totalCount);
      setTotalPages(d.totalPages);
      setHasPrevious(d.hasPrevious);
      setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    listCategories({ PageSize: 200 })
      .then((r) => setCategories(r.data.items?.map((c) => ({ id: c.id, name: c.name })) ?? []))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load categories."));
    listSuppliers({ PageSize: 200 })
      .then((r) => setSuppliers(r.data.items?.map((s) => ({ id: s.id, name: s.name })) ?? []))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load suppliers."));
  }, []);

  const columns: ColumnDef<ProductDto, unknown>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span>,
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "categoryName", header: "Category" },
    { accessorKey: "supplierName", header: "Supplier", cell: ({ getValue }) => (getValue() as string | null) ?? "—" },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ getValue }) => unitOfMeasureLabels[getValue() as UnitOfMeasure] ?? "—",
    },
    {
      accessorKey: "costPrice",
      header: "Cost Price",
      cell: ({ getValue }) => formatCurrency(getValue() as number, productCurrency),
    },
    {
      accessorKey: "unitPrice",
      header: "Unit Price",
      cell: ({ getValue }) => formatCurrency(getValue() as number, productCurrency),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const s = getValue() as CommonStatus;
        return <Badge variant={statusVariant[s]}>{commonStatusLabels[s]}</Badge>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditTarget(row.original);
              setFormOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleSubmit = async (values: Record<string, unknown>) => {
    setIsSaving(true);
    try {
      if (editTarget) {
        await updateProduct(editTarget.id, values as unknown as Parameters<typeof updateProduct>[1]);
        toast.success("Product updated.");
      } else {
        await createProduct(values as unknown as Parameters<typeof createProduct>[0]);
        toast.success("Product created.");
      }
      setFormOpen(false);
      setEditTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success("Product deleted.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <Button
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        }
      />
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>
      <DataTable columns={columns} data={products} isLoading={isLoading} />
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
      <ProductForm
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditTarget(null);
        }}
        onSubmit={handleSubmit}
        defaultValues={editTarget}
        categories={categories}
        suppliers={suppliers}
        isLoading={isSaving}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
