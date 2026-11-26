"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useActiveEvent } from "@/lib/event-context";
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
import { Plus, CheckCircle2 } from "lucide-react";

interface Event {
  id: string;
  name: string;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export default function EventsPage() {
  const { activeEventId, setActiveEventId } = useActiveEvent();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: "", startDate: "", endDate: "" });

  async function loadEvents() {
    setLoading(true);
    const res = await apiFetch("/api/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data);

      if (!activeEventId && data.length > 0) {
        setActiveEventId(data[0].id);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await apiFetch("/api/events", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      }),
    });

    if (res.ok) {
      const newEvent = await res.json();
      toast.success("Evento criado com sucesso");
      setDialogOpen(false);
      setForm({ name: "", startDate: "", endDate: "" });
      await loadEvents();
      setActiveEventId(newEvent.id);
    } else {
      toast.error("Erro ao criar evento");
    }
    setSaving(false);
  }

  async function toggleOperation(event: Event) {
    const res = await apiFetch(`/api/events/${event.id}/status`, {
      method: "PUT",
      body: JSON.stringify({ active: !event.active }),
    });

    if (res.ok) {
      toast.success(
        !event.active
          ? `"${event.name}" está em operação no app`
          : `"${event.name}" foi tirado de operação`
      );
      loadEvents();
    } else {
      toast.error("Erro ao atualizar o evento");
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Eventos</h1>
          <p className="text-sm text-muted-foreground">
            <strong>Selecionado</strong>: o evento que você está gerenciando neste painel.{" "}
            <strong>Em operação</strong>: o evento que o aplicativo usa (apenas um por vez).
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4 mr-2" />
                Novo evento
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label>Nome do evento</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Festa Junina 2026"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Data de início (opcional)</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Data de fim (opcional)</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Criando..." : "Criar evento"}
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
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            <TableHead>No app</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
          )}
          {!loading && events.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum evento cadastrado ainda</TableCell></TableRow>
          )}
          {events.map((event) => (
            <TableRow key={event.id} className={event.id === activeEventId ? "bg-muted/40" : ""}>
              <TableCell className="font-medium flex items-center gap-2">
                {event.name}
                {event.id === activeEventId && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="size-3" />
                    Selecionado
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(event.startDate)}</TableCell>
              <TableCell>{formatDate(event.endDate)}</TableCell>
              <TableCell>
                {event.active ? (
                  <Badge className="bg-green-600 hover:bg-green-600">Em operação</Badge>
                ) : (
                  <Badge variant="secondary">Inativo</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={event.id === activeEventId}
                  onClick={() => {
                    setActiveEventId(event.id);
                    toast.success(`"${event.name}" selecionado no painel`);
                  }}
                >
                  {event.id === activeEventId ? "Selecionado" : "Selecionar"}
                </Button>
                <Button
                  size="sm"
                  variant={event.active ? "destructive" : "default"}
                  onClick={() => toggleOperation(event)}
                >
                  {event.active ? "Tirar de operação" : "Colocar em operação"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}