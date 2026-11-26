"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const stallId = searchParams.get("stallId");
  const stallName = searchParams.get("stallName") ?? "Barraca";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", categoryId: "" });

  async function loadData() {
    if (!stallId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      apiFetch(`/api/products?stallId=${stallId}`),
      apiFetch("/api/categories"),
    ]);
    if (productsRes.ok) setProducts(await productsRes.json());
    if (categoriesRes.ok) setCategories(await categoriesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stallId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!stallId) return;
    setSaving(true);

    const res = await apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        stallId,
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price.replace(",", ".")),
        categoryId: form.categoryId || undefined,
      }),
    });

    if (res.ok) {
      toast.success("Produto criado com sucesso");
      setDialogOpen(false);
      setForm({ name: "", description: "", price: "", categoryId: "" });
      loadData();
    } else {
      toast.error("Erro ao criar produto");
    }
    setSaving(false);
  }

  function formatCurrency(value: string) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  if (!stallId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <p className="text-muted-foreground">Selecione uma barraca para ver seus produtos.</p>
        <Link href="/stalls">
          <Button>Ir para Barracas</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/stalls" className="text-sm text-muted-foreground flex items-center gap-1 mb-1 hover:underline">
            <ArrowLeft className="size-3" />
            Voltar para Barracas
          </Link>
          <h1 className="text-2xl font-semibold">Produtos — {stallName}</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4 mr-2" />
                Novo produto
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Espetinho de Carne"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Descrição (opcional)</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Preço (R$)</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Ex: 12,50"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Categoria (opcional)</Label>
                <Select value={form.categoryId} onValueChange={(value) => setForm({ ...form, categoryId: value ?? "" })}>
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma categoria">
                        {(value: string) => categories.find((c) => c.id === value)?.name ?? "Selecione uma categoria"}
                    </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                    {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>  
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Criando..." : "Criar produto"}
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
            <TableHead>Descrição</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Carregando...</TableCell></TableRow>
          )}
          {!loading && products.length === 0 && (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum produto cadastrado ainda</TableCell></TableRow>
          )}
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">{product.description ?? "—"}</TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell>
                {product.available ? (
                  <Badge className="bg-green-600 hover:bg-green-600">Disponível</Badge>
                ) : (
                  <Badge variant="secondary">Indisponível</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
      <ProductsContent />
    </Suspense>
  );
}