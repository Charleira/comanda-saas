"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { getUser } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CASHIER" | "OPERATOR";
  createdAt: string;
}

const ROLE_LABELS: Record<User["role"], string> = {
  ADMIN: "Administrador",
  CASHIER: "Caixa",
  OPERATOR: "Operador",
};

const ROLE_COLORS: Record<User["role"], string> = {
  ADMIN: "bg-purple-600 hover:bg-purple-600",
  CASHIER: "bg-blue-600 hover:bg-blue-600",
  OPERATOR: "bg-slate-600 hover:bg-slate-600",
};

export default function UsersPage() {
  const currentUser = getUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "OPERATOR" as User["role"],
  });

  async function loadUsers() {
    setLoading(true);
    const res = await apiFetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Usuário cadastrado com sucesso");
      setDialogOpen(false);
      setForm({ name: "", email: "", password: "", role: "OPERATOR" });
      loadUsers();
    } else {
      const data = await res.json();
      toast.error(data.error === "EMAIL_ALREADY_REGISTERED" ? "Este email já está cadastrado" : "Erro ao cadastrar usuário");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await apiFetch(`/api/users/${id}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("Usuário removido");
      loadUsers();
    } else {
      const data = await res.json();
      toast.error(data.error === "CANNOT_DELETE_SELF" ? "Você não pode remover a si mesmo" : "Erro ao remover usuário");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuários</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4 mr-2" />
                Novo usuário
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Senha inicial</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              </div>
              <div className="space-y-1">
                <Label>Função</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) => setForm({ ...form, role: (value ?? "OPERATOR") as User["role"] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a função">
                      {(value: string) => ROLE_LABELS[value as User["role"]] ?? "Selecione a função"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="CASHIER">Caixa</SelectItem>
                    <SelectItem value="OPERATOR">Operador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Cadastrando..." : "Cadastrar usuário"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
          )}
          {!loading && users.length === 0 && (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum usuário cadastrado</TableCell></TableRow>
          )}
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.name}
                {user.id === currentUser?.id && <span className="text-muted-foreground text-xs ml-2">(você)</span>}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {user.id !== currentUser?.id && (
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button size="icon" variant="destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso vai remover o acesso de {user.name} imediatamente. Essa ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(user.id)}>Remover</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}