"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { changePassword, deleteSession, getMe, getSessions, updateMe } from "@/lib/api/me";
import { useAuthStore } from "@/stores/auth/auth-provider";
import { type SessionSummaryDto, type UserDto } from "@/lib/api/types";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string().min(1, "Confirm your new password"),
}).refine((d) => d.newPassword === d.confirmNewPassword, { message: "Passwords do not match", path: ["confirmNewPassword"] });
type PasswordFormValues = z.infer<typeof passwordSchema>;

function ProfileTab({ user, onUpdate }: { user: UserDto; onUpdate: (u: UserDto) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user.firstName ?? "", lastName: user.lastName ?? "", phoneNumber: user.phoneNumber ?? "" },
  });

  const handleSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const res = await updateMe({ firstName: values.firstName, lastName: values.lastName, phoneNumber: values.phoneNumber });
      toast.success("Profile updated.");
      setUser(res.data);
      onUpdate(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally { setIsLoading(false); }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup className="gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="font-mono text-sm">{user.userName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Controller control={form.control} name="firstName" render={({ field }) => (
                <Field><FieldLabel>First Name</FieldLabel><Input {...field} /></Field>
              )} />
              <Controller control={form.control} name="lastName" render={({ field }) => (
                <Field><FieldLabel>Last Name</FieldLabel><Input {...field} /></Field>
              )} />
            </div>
            <Controller control={form.control} name="phoneNumber" render={({ field }) => (
              <Field><FieldLabel>Phone</FieldLabel><Input {...field} /></Field>
            )} />
            {(user.roles ?? []).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Roles</p>
                <div className="flex gap-1 flex-wrap">
                  {(user.roles ?? []).map((r) => <Badge key={r} variant="outline">{r}</Badge>)}
                </div>
              </div>
            )}
          </FieldGroup>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving…" : "Save Changes"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SecurityTab() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const handleSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true);
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword, confirmNewPassword: values.confirmNewPassword });
      toast.success("Password changed successfully.");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally { setIsLoading(false); }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup className="gap-3">
            <Controller control={form.control} name="currentPassword" render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Current Password</FieldLabel>
                <Input {...field} type="password" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )} />
            <Controller control={form.control} name="newPassword" render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>New Password</FieldLabel>
                <Input {...field} type="password" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )} />
            <Controller control={form.control} name="confirmNewPassword" render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Confirm New Password</FieldLabel>
                <Input {...field} type="password" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )} />
          </FieldGroup>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Changing…" : "Change Password"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SessionsTab() {
  const [sessions, setSessions] = useState<SessionSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState<SessionSummaryDto | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load sessions.");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRevoke = async () => {
    if (!revokeTarget?.sessionId) return;
    setIsRevoking(true);
    try {
      await deleteSession(revokeTarget.sessionId);
      toast.success("Session revoked.");
      setRevokeTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke session.");
    } finally { setIsRevoking(false); }
  };

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading sessions…</p>;

  return (
    <>
      <div className="space-y-3 max-w-2xl">
        {sessions.length === 0 && <p className="text-muted-foreground text-sm">No active sessions found.</p>}
        {sessions.map((s) => (
          <Card key={s.sessionId}>
            <CardContent className="pt-4 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{s.deviceName ?? "Unknown device"}</p>
                  {s.isCurrent && <Badge variant="default" className="text-xs">Current</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{s.clientType ?? "Unknown client"} · {s.ipAddress ?? "Unknown IP"}</p>
                <p className="text-xs text-muted-foreground">
                  Started: {new Date(s.createdUtc).toLocaleString()}
                  {s.lastUsedUtc && ` · Last used: ${new Date(s.lastUsedUtc).toLocaleString()}`}
                </p>
              </div>
              {!s.isCurrent && (
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setRevokeTarget(s)}>Revoke</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(o) => { if (!o) setRevokeTarget(null); }}
        title="Revoke Session"
        description="This will sign out the device. Continue?"
        onConfirm={handleRevoke}
        isLoading={isRevoking}
        confirmLabel="Revoke"
      />
    </>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMe().then((res) => setUser(res.data)).catch(() => toast.error("Failed to load profile.")).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (!user) return <div className="p-6 text-muted-foreground">Failed to load profile.</div>;

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account settings" />
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><ProfileTab user={user} onUpdate={setUser} /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
        <TabsContent value="sessions"><SessionsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
