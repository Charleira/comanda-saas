"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { useActiveEvent } from "@/lib/event-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Store, UserCog, X } from "lucide-react";

interface Stall {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  active: boolean;
}

interface AvailableOperator {
  id: string;
  name: string;
}

interface AssignedOperator {
  id: string;
  userId: string;
  user: { id: string; name: string };
}

const PRESET_COLORS = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6", "#A855F7", "#EC4899"];

export default function StallsPage() {
  const { activeEventId } = useActiveEvent();
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", color: PRESET_COLORS[0] });

  const [operatorsDialogOpen, setOperatorsDialogOpen] = useState(false);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [availableOperators, setAvailableOperators] = useState<AvailableOperator[]>([]);
  const [assignedOperators, setAssignedOperators] = useState<AssignedOperator[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState("");

  async function loadStalls() {
    if (!activeEventId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await apiFetch(`/api/stalls?eventId=${activeEventId}`);
    if (res.ok) setStalls(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadStalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEventId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!activeEventId) return;
    setSaving(true);

    const res = await apiFetch("/api/stalls", {
      method: "POST",
      body: JSON.stringify({ eventId: activeEventId, name: form.name, color: form.color }),
    });

    if (res.ok) {
      toast.success("Barraca criada com sucesso");
      setDialogOpen(false);
      setForm({ name: "", color: PRESET_COLORS[0] });
      loadStalls();
    } else {
      toast.error("Erro ao criar barraca");
    }
    setSaving(false);
  }

  async function openOperatorsDialog(stall: Stall) {
    setSelectedStall(stall);
    setOperatorsDialogOpen(true);

    const [usersRes, assignedRes] = await Promise.all([
      apiFetch("/api/users"),
      apiFetch(`/api/stalls/${stall.id}/operators`),
    ]);

    if (usersRes.ok) {
      const users = await usersRes.json();
      setAvailableOperators(users.filter((u: { role: string }) => u.role === "OPERATOR"));
    }
    if (assignedRes.ok) {
      setAssignedOperators(await assignedRes.json());
    }
  }

  async function handleAssignOperator() {
    if (!selectedStall || !selectedOperatorId) return;

    const res = await apiFetch(`/api/stalls/${selectedStall.id}/operators`, {
      method: "POST",
      body: JSON.stringify({ userId: selectedOperatorId }),
    });

    if (res.ok) {
      toast.success("Operador vinculado à barraca");
      setSelectedOperatorId("");
      openOperatorsDialog(selectedStall);
    } else {
      toast.error("Erro ao vincular operador");
    }
  }

  async function handleUnassignOperator(userId: string) {
    if (!selectedStall) return;

    const res = await apiFetch(`/api/stalls/${selectedStall.id}/operators/${userId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Operador removido da barraca");
      openOperatorsDialog(selectedStall);
    } else {
      toast.error("Erro ao remover operador");
    }
  }

  if (!activeEventId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Barracas</h1>
        <p className="text-muted-foreground">Selecione um evento primeiro para gerenciar suas barracas.</p>
        <Link href="/events">
          <Button>Ir para Eventos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Barracas</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4 mr-2" />
                Nova barraca
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar barraca</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Barraca do Churrasco"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className="size-8 rounded-full border-2"
                      style={{
                        backgroundColor: color,
                        borderColor: form.color === color ? "#000" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Criando..." : "Criar barraca"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p className="text-muted-foreground">Carregando...</p>}

      {!loading && stalls.length === 0 && (
        <p className="text-muted-foreground">Nenhuma barraca cadastrada neste evento ainda.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {stalls.map((stall) => (
          <Card key={stall.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div
                className="size-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: stall.color ?? "#888" }}
              >
                <Store className="size-5" />
              </div>
              <CardTitle className="text-base">{stall.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/products?stallId=${stall.id}&stallName=${encodeURIComponent(stall.name)}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Ver produtos
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => openOperatorsDialog(stall)}
              >
                <UserCog className="size-4 mr-2" />
                Operadores
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={operatorsDialogOpen} onOpenChange={setOperatorsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Operadores — {selectedStall?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Select
                value={selectedOperatorId}
                onValueChange={(value) => setSelectedOperatorId(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um operador">
                    {(value: string) =>
                      availableOperators.find((o) => o.id === value)?.name ?? "Selecione um operador"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableOperators
                    .filter((op) => !assignedOperators.some((a) => a.userId === op.id))
                    .map((op) => (
                      <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAssignOperator} disabled={!selectedOperatorId}>
                Vincular
              </Button>
            </div>

            <div className="space-y-2">
              {assignedOperators.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum operador vinculado a esta barraca ainda.</p>
              )}
              {assignedOperators.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm">{a.user.name}</span>
                  <Button size="icon" variant="ghost" onClick={() => handleUnassignOperator(a.userId)}>
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}