"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserFormDialog } from "@/components/admin/UserFormDialog";
import {
  UserPlus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  ShieldCheck,
  UserCog,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface UserTableProps {
  currentUserId: string;
  currentUserRole: string;
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ADMIN: ShieldCheck,
  SECRETAIRE: UserCog,
  EMPLOYE: User,
};

const roleBadgeVariants: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  SECRETAIRE: "bg-blue-100 text-blue-700 border-blue-200",
  EMPLOYE: "bg-gray-100 text-gray-700 border-gray-200",
};

export function UserTable({ currentUserId, currentUserRole }: UserTableProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {
      console.error("Erreur chargement utilisateurs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function openCreate() {
    setEditingUser(null);
    setDialogOpen(true);
  }

  function openEdit(user: UserProfile) {
    setEditingUser(user);
    setDialogOpen(true);
  }

  async function handleDelete(user: UserProfile) {
    if (!confirm(`Supprimer ${user.name} ? Cette action est irréversible.`)) return;

    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: "Erreur", description: data.error });
      } else {
        toast({ title: "Utilisateur supprimé", description: `${user.name} a été supprimé.` });
        fetchUsers();
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur réseau" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des utilisateurs
              </CardTitle>
              <CardDescription>
                {users.length} compte{users.length !== 1 ? "s" : ""} au total
              </CardDescription>
            </div>
            <Button
              onClick={openCreate}
              className="bg-[#1E3A5F] hover:bg-[#2D5A8E]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Users className="h-10 w-10 mx-auto mb-2" />
              <p>Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Rôle</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Créé le</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const RoleIcon = roleIcons[user.role] || User;
                    return (
                      <tr
                        key={user.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F]">
                              <RoleIcon className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-gray-900">{user.name}</span>
                            {user.id === currentUserId && (
                              <Badge variant="outline" className="text-xs">Vous</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">{user.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeVariants[user.role]}`}
                          >
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {user.active ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">Actif</Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">Inactif</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(user)}
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {user.id !== currentUserId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(user)}
                                disabled={deletingId === user.id}
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              >
                                {deletingId === user.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSuccess={fetchUsers}
        currentUserRole={currentUserRole}
      />
    </>
  );
}
