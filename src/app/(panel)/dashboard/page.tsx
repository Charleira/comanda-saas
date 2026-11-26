"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useActiveEvent } from "@/lib/event-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardData {
  revenue: { today: string; total: string; averageTicket: number };
  customersCount: number;
  cardsCount: number;
  balance: { loaded: string; consumed: string };
  topProducts: { product: { name: string }; quantitySold: number; revenue: string }[];
  topStalls: { stall: { name: string }; revenue: string }[];
}

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardPage() {
  const { activeEventId } = useActiveEvent();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeEventId) {
      setLoading(false);
      return;
    }

    async function loadDashboard() {
      setLoading(true);
      const res = await apiFetch(`/api/dashboard?eventId=${activeEventId}`);
      if (res.ok) setData(await res.json());
      setLoading(false);
    }
    loadDashboard();
  }, [activeEventId]);

  if (!activeEventId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Nenhum evento selecionado ainda.</p>
        <Link href="/events">
          <Button>Ir para Eventos</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground">Não foi possível carregar os dados do evento.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Faturamento hoje</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCurrency(data.revenue.today)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Faturamento total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCurrency(data.revenue.total)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ticket médio</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(data.revenue.averageTicket)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cartões ativos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.cardsCount}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Saldo carregado</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCurrency(data.balance.loaded)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Saldo consumido</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCurrency(data.balance.consumed)}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos mais vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topProducts.length === 0 && <p className="text-sm text-muted-foreground">Sem vendas ainda</p>}
            {data.topProducts.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.product?.name}</span>
                <span className="text-muted-foreground">{item.quantitySold}x — {formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Barracas com maior faturamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topStalls.length === 0 && <p className="text-sm text-muted-foreground">Sem vendas ainda</p>}
            {data.topStalls.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.stall?.name}</span>
                <span className="text-muted-foreground">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}