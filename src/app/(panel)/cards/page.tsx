"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { useActiveEvent } from "@/lib/event-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Search } from "lucide-react";

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function CardsContent() {
  const searchParams = useSearchParams();
  const { activeEventId } = useActiveEvent();
  const customerId = searchParams.get("customerId");
  const customerName = searchParams.get("customerName") ?? "Cliente";

  const [nfcId, setNfcId] = useState("");
  const [cardId, setCardId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [rechargeValue, setRechargeValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [recharging, setRecharging] = useState(false);

  async function handleConsult(e: React.FormEvent) {
    e.preventDefault();
    if (!nfcId) return;
    setLoading(true);

    const res = await apiFetch(`/api/cards?nfcId=${encodeURIComponent(nfcId)}`);

    if (res.ok) {
      const data = await res.json();
      setCardId(data.cardId);
      setBalance(data.balance);
    } else {
      setCardId(null);
      setBalance(null);
      toast.error("Cartão não encontrado. Você pode vinculá-lo abaixo.");
    }
    setLoading(false);
  }

  async function handleLink() {
    if (!nfcId || !activeEventId) return;
    setLinking(true);

    const res = await apiFetch("/api/cards", {
      method: "POST",
      body: JSON.stringify({
        eventId: activeEventId,
        nfcId,
        customerId: customerId ?? undefined,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      toast.success("Cartão vinculado com sucesso");
      setCardId(data.id);
      setBalance(data.balance);
    } else {
      const data = await res.json();
      toast.error(data.error === "NFC_ALREADY_REGISTERED" ? "Este cartão já está cadastrado" : "Erro ao vincular cartão");
    }
    setLinking(false);
  }

  async function handleRecharge(e: React.FormEvent) {
    e.preventDefault();
    if (!cardId || !rechargeValue) return;
    setRecharging(true);

    const res = await apiFetch("/api/recharges", {
      method: "POST",
      body: JSON.stringify({ cardId, value: Number(rechargeValue.replace(",", ".")) }),
    });

    if (res.ok) {
      const data = await res.json();
      setBalance(data.newBalance);
      setRechargeValue("");
      toast.success("Recarga realizada com sucesso");
    } else {
      toast.error("Erro ao realizar recarga");
    }
    setRecharging(false);
  }

  return (
    <div className="space-y-6 max-w-lg">
      {customerId && (
        <Link href="/customers" className="text-sm text-muted-foreground flex items-center gap-1 hover:underline">
          <ArrowLeft className="size-3" />
          Voltar para Clientes
        </Link>
      )}

      <div>
        <h1 className="text-2xl font-semibold">Cartões NFC</h1>
        {customerId && <p className="text-sm text-muted-foreground">Vinculando para: {customerName}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consultar cartão</CardTitle>
          <CardDescription>Aproxime o leitor NFC ou digite o número de série</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConsult} className="flex gap-2">
            <Input
              placeholder="Ex: 8164D250"
              value={nfcId}
              onChange={(e) => setNfcId(e.target.value)}
              required
            />
            <Button type="submit" variant="outline" size="icon" disabled={loading}>
              <Search className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {cardId && balance !== null && (
        <Card className="border-green-600/30 bg-green-600/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4" />
              Saldo atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(balance)}</p>
          </CardContent>
        </Card>
      )}

      {!cardId && nfcId && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cartão não encontrado</CardTitle>
            <CardDescription>
              Vincule este número de série {customerId ? "a este cliente" : "a um novo cartão"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLink} disabled={linking} className="w-full">
              {linking ? "Vinculando..." : "Vincular cartão"}
            </Button>
          </CardContent>
        </Card>
      )}

      {cardId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recarregar saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecharge} className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label>Valor (R$)</Label>
                <Input
                  value={rechargeValue}
                  onChange={(e) => setRechargeValue(e.target.value)}
                  placeholder="Ex: 50,00"
                  required
                />
              </div>
              <Button type="submit" disabled={recharging} className="self-end">
                {recharging ? "Processando..." : "Recarregar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CardsPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
      <CardsContent />
    </Suspense>
  );
}