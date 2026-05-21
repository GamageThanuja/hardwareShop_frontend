"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { PageHeader } from "@/components/page-header";
import { RowActions } from "@/components/row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { UserDto } from "@/lib/api/types";
import { assignRoles, createUser, deleteUser, listUsers, updateUser } from "@/lib/api/users";

const AVAILABLE_ROLES = ["Admin", "Manager", "Staff"];

const createSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  userName: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roles: z.array(z.string()),
});

const editSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  isActive: z.boolean(),
  roles: z.array(z.string()),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

function CreateUserForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: CreateFormValues) => Promise<void>;
  isLoading?: boolean;
}) {
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema) as Resolver<CreateFormValues>,
    defaultValues: { firstName: "", lastName: "", userName: "", email: "", phoneNumber: "", password: "", roles: [] },
  });

  useEffect(() => {
    if (!open)
      form.reset({ firstName: "", lastName: "", userName: "", email: "", phoneNumber: "", password: "", roles: [] });
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(async (v) => {
            await onSubmit(v);
          })}
          className="space-y-4"
        >
          <FieldGroup className="gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>First Name</FieldLabel>
                    <Input {...field} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Last Name</FieldLabel>
                    <Input {...field} />
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="userName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Username *</FieldLabel>
                  <Input {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Email *</FieldLabel>
                  <Input {...field} type="email" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Phone</FieldLabel>
                    <Input {...field} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Password *</FieldLabel>
                    <Input {...field} type="password" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="roles"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Roles</FieldLabel>
                  <div className="flex gap-4">
                    {AVAILABLE_ROLES.map((role) => (
                      <span key={role} className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          checked={field.value.includes(role)}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? [...field.value, role] : field.value.filter((r) => r !== role));
                          }}
                        />
                        {role}
                      </span>
                    ))}
                  </div>
                </Field>
              )}
            />
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

function EditUserForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: EditFormValues) => Promise<void>;
  defaultValues: UserDto | null;
  isLoading?: boolean;
}) {
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema) as Resolver<EditFormValues>,
    defaultValues: { firstName: "", lastName: "", phoneNumber: "", isActive: true, roles: [] },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        firstName: defaultValues.firstName ?? "",
        lastName: defaultValues.lastName ?? "",
        phoneNumber: defaultValues.phoneNumber ?? "",
        isActive: defaultValues.isActive,
        roles: defaultValues.roles ?? [],
      });
    }
  }, [defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User — {defaultValues?.userName}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(async (v) => {
            await onSubmit(v);
          })}
          className="space-y-4"
        >
          <FieldGroup className="gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>First Name</FieldLabel>
                    <Input {...field} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Last Name</FieldLabel>
                    <Input {...field} />
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Phone</FieldLabel>
                  <Input {...field} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Field>
                  <span className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    <span>Active</span>
                  </span>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="roles"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Roles</FieldLabel>
                  <div className="flex gap-4">
                    {AVAILABLE_ROLES.map((role) => (
                      <span key={role} className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          checked={field.value.includes(role)}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? [...field.value, role] : field.value.filter((r) => r !== role));
                          }}
                        />
                        {role}
                      </span>
                    ))}
                  </div>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const [items, setItems] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listUsers({ Page: page, PageSize: pageSize, Search: search || undefined });
      const d = res.data;
      setItems(d.items ?? []);
      setTotalCount(d.totalCount);
      setTotalPages(d.totalPages);
      setHasPrevious(d.hasPrevious);
      setHasNext(d.hasNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: ColumnDef<UserDto, unknown>[] = [
    {
      accessorKey: "userName",
      header: "Username",
      cell: ({ getValue }) => <span className="font-mono text-sm">{getValue() as string}</span>,
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim() || "—",
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ getValue }) => {
        const roles = (getValue() as string[] | null) ?? [];
        return roles.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {roles.map((r) => (
              <Badge key={r} variant="outline">
                {r}
              </Badge>
            ))}
          </div>
        ) : (
          "—"
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ getValue }) => (
        <Badge variant={(getValue() as boolean) ? "default" : "secondary"}>
          {(getValue() as boolean) ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <RowActions
          actions={[
            { label: "Edit", onClick: () => setEditTarget(row.original) },
            { label: "Delete", onClick: () => setDeleteTarget(row.original), destructive: true, separator: true },
          ]}
        />
      ),
    },
  ];

  const handleCreate = async (values: CreateFormValues) => {
    setIsSaving(true);
    try {
      const user = await createUser({
        firstName: values.firstName,
        lastName: values.lastName,
        userName: values.userName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        roles: values.roles,
      });
      if (values.roles.length > 0) {
        await assignRoles(user.data.id, { roles: values.roles });
      }
      toast.success("User created.");
      setCreateOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (values: EditFormValues) => {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      await updateUser(editTarget.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        isActive: values.isActive,
      });
      await assignRoles(editTarget.id, { roles: values.roles });
      toast.success("User updated.");
      setEditTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success("User deleted.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage system users and roles"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Button>
        }
      />
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search users…"
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
      <CreateUserForm open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} isLoading={isSaving} />
      <EditUserForm
        open={!!editTarget}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
        onSubmit={handleEdit}
        defaultValues={editTarget}
        isLoading={isSaving}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title="Delete User"
        description={`Delete user "${deleteTarget?.userName}"?`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmLabel="Delete"
      />
    </div>
  );
}
