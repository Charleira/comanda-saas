"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  async function loadCategories() {
    setLoading(true);
    const res = await apiFetch("/api/categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await apiFetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      toast.success("Categoria criada com sucesso");
      setDialogOpen(false);
      setName("");
      loadCategories();
    } else {
      toast.error("Erro ao criar categoria");
    }
    setSaving(false);
  }

  function openEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDialogOpen(true);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);

    const res = await apiFetch(`/api/categories/${editingId}`, {
      method: "PUT",
      body: JSON.stringify({ name: editName }),
    });

    if (res.ok) {
      toast.success("Categoria atualizada");
      setEditDialogOpen(false);
      loadCategories();
    } else {
      toast.error("Erro ao atualizar categoria");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await apiFetch(`/api/categories/${id}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("Categoria excluída");
      loadCategories();
    } else {
      const data = await res.json();
      toast.error(
        data.error === "CATEGORY_IN_USE"
          ? "Não é possível excluir: há produtos usando esta categoria"
          : "Erro ao excluir categoria"
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categorias</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4 mr-2" />
                Nova categoria
              </Button>
            }
          />
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Criar categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Bebidas"
                  required
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Criando..." : "Criar categoria"}
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
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
          )}
          {!loading && categories.length === 0 && (
            <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Nenhuma categoria cadastrada ainda</TableCell></TableRow>
          )}
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="icon" variant="outline" onClick={() => openEdit(category)}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-3">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}