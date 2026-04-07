"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserProfile } from "@/types";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserProfile | null;
  onSuccess: () => void;
  currentUserRole: string;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
  currentUserRole,
}: UserFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYE",
    active: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        active: user.active,
      });
    } else {
      setForm({ name: "", email: "", password: "", role: "EMPLOYE", active: true });
    }
  }, [user, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = user ? `/api/users/${user.id}` : "/api/users";
      const method = user ? "PUT" : "POST";

      const body = { ...form };
      if (user && !body.password) {
        delete (body as Record<string, unknown>).password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: "Erreur", description: data.error });
      } else {
        toast({
          title: user ? "Utilisateur modifié" : "Utilisateur créé",
          description: `${form.name} a été ${user ? "mis à jour" : "créé"} avec succès.`,
        });
        onSuccess();
        onOpenChange(false);
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur réseau" });
    } finally {
      setIsLoading(false);
    }
  }

  const availableRoles = Object.entries(ROLE_LABELS).filter(([role]) => {
    if (role === "ADMIN" && currentUserRole !== "ADMIN") return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Modifiez les informations de l'utilisateur."
              : "Renseignez les informations du nouvel utilisateur."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jean Dupont"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jean.dupont@smp.fr"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              {user ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={user ? "Laisser vide pour conserver" : "Minimum 8 caractères"}
              required={!user}
              minLength={user ? 0 : 8}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Rôle</Label>
            <Select
              value={form.role}
              onValueChange={(value) => setForm({ ...form, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(([role, label]) => (
                  <SelectItem key={role} value={role}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {user && (
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select
                value={form.active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setForm({ ...form, active: value === "active" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Désactivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#1E3A5F] hover:bg-[#2D5A8E]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : user ? (
                "Enregistrer"
              ) : (
                "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
