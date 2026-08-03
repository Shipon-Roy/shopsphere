"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Eye, ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import type { IUser, PaginatedResponse } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<IUser>["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmUser, setConfirmUser] = useState<{ id: string; block: boolean; name: string } | null>(null);
  const [actioning, setActioning] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/users?${params}`);
      const json: PaginatedResponse<IUser> = await res.json();
      setUsers(json.data ?? []);
      setPagination(json.pagination ?? null);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleToggleBlock = async () => {
    if (!confirmUser) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/users/${confirmUser.id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: confirmUser.block }),
      });
      if (!res.ok) throw new Error();
      toast.success(confirmUser.block ? "User blocked" : "User unblocked");
      setConfirmUser(null);
      fetchUsers();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setActioning(false);
    }
  };

  const columns: Column<IUser>[] = [
    {
      key: "name",
      header: "User",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{u.name}</p>
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (u) => (
        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
          {u.role === "admin" ? "Admin" : "User"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (u) => (
        <Badge variant={u.isBlocked ? "destructive" : "success"}>
          {u.isBlocked ? "Blocked" : "Active"}
        </Badge>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      cell: (u) => (
        <span className="text-sm text-muted-foreground">
          {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-24",
      cell: (u) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/admin/users/${u._id}`} aria-label="View user"><Eye className="h-4 w-4" /></Link>
          </Button>
          <Button
            variant="ghost" size="icon-sm"
            className={u.isBlocked ? "text-success hover:text-success" : "text-destructive hover:text-destructive"}
            onClick={() => setConfirmUser({ id: u._id, block: !u.isBlocked, name: u.name })}
            aria-label={u.isBlocked ? "Unblock user" : "Block user"}
          >
            {u.isBlocked ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Users" description="Manage registered users" breadcrumbs={[{ label: "Users" }]} />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <DataTable columns={columns} data={users} loading={loading} emptyTitle="No users found" />
      {pagination && <Pagination pagination={pagination} className="mt-2" />}

      <ConfirmDialog
        open={!!confirmUser}
        onOpenChange={(o) => !o && setConfirmUser(null)}
        title={confirmUser?.block ? `Block ${confirmUser?.name}?` : `Unblock ${confirmUser?.name}?`}
        description={confirmUser?.block
          ? "This user will be unable to log in or place orders."
          : "This user will regain full access to their account."}
        confirmLabel={confirmUser?.block ? "Block" : "Unblock"}
        variant={confirmUser?.block ? "destructive" : "default"}
        loading={actioning}
        onConfirm={handleToggleBlock}
      />
    </div>
  );
}
