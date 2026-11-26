"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
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
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Organization {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "BLOCKED" | "TRIAL";
  plan: string;
  _count: { events: number; users: number };
}

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", cnpj: "", phone: "",
    adminName: "", adminEmail: "", adminPassword: "",
  });

  async function loadOrgs() {
    setLoading(true);
    const res = await apiFetch("/api/admin/organizations");
    if (res.ok) setOrgs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadOrgs();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await apiFetch("/api/admin/organizations", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Organização criada com sucesso");
      setDialogOpen(false);
      setForm({ name: "", email: "", cnpj: "", phone: "", adminName: "", adminEmail: "", adminPassword: "" });
      loadOrgs();
    } else {
      const data = await res.json();
      toast.error(data.error === "EMAIL_ALREADY_REGISTERED" ? "Email já cadastrado" : "Erro ao criar organização");
    }
    setSaving(false);
  }

  async function toggleStatus(org: Organization) {
    const newStatus = org.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const res = await apiFetch(`/api/admin/organizations/${org.id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      toast.success(newStatus === "BLOCKED" ? "Organização bloqueada" : "Organização reativada");
      loadOrgs();
    } else {
      toast.error("Erro ao atualizar status");
    }
  }

  function statusBadge(status: Organization["status"]) {
    if (status === "ACTIVE") return <Badge className="bg-green-600 hover:bg-green-600">Ativa</Badge>;
    if (status === "BLOCKED") return <Badge variant="destructive">Bloqueada</Badge>;
    return <Badge variant="secondary">Trial</Badge>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Organizações</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4 mr-2" />
                Nova organização
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar organização</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label>Nome da organização</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Email da organização</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>CNPJ (opcional)</Label>
                <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Telefone (opcional)</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>

              <Separator />

              <p className="text-sm text-muted-foreground pt-1">Administrador responsável</p>

              <div className="space-y-1">
                <Label>Nome do admin</Label>
                <Input value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Email do admin</Label>
                <Input type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Senha inicial</Label>
                <Input type="password" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} required minLength={6} />
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Criando..." : "Criar organização"}
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
            <TableHead>Status</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Eventos</TableHead>
            <TableHead>Usuários</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
          )}
          {!loading && orgs.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhuma organização cadastrada</TableCell></TableRow>
          )}
          {orgs.map((org) => (
            <TableRow key={org.id}>
              <TableCell className="font-medium">{org.name}</TableCell>
              <TableCell>{org.email}</TableCell>
              <TableCell>{statusBadge(org.status)}</TableCell>
              <TableCell className="capitalize">{org.plan}</TableCell>
              <TableCell>{org._count.events}</TableCell>
              <TableCell>{org._count.users}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={org.status === "ACTIVE" ? "destructive" : "outline"}
                  onClick={() => toggleStatus(org)}
                >
                  {org.status === "ACTIVE" ? "Bloquear" : "Reativar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}