import { prisma } from "@/lib/prisma";

export const dashboardRepository = {
  // Faturamento total e do dia + ticket médio + quantidade de vendas
  getSalesSummary: async (organizationId: string, eventId: string) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalAgg, todayAgg] = await Promise.all([
      prisma.sale.aggregate({
        where: { organizationId, eventId, canceled: false },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.sale.aggregate({
        where: { organizationId, eventId, canceled: false, createdAt: { gte: startOfDay } },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalRevenue: totalAgg._sum.total ?? 0,
      totalSalesCount: totalAgg._count.id,
      todayRevenue: todayAgg._sum.total ?? 0,
      todaySalesCount: todayAgg._count.id,
      averageTicket:
        totalAgg._count.id > 0
          ? Number(totalAgg._sum.total ?? 0) / totalAgg._count.id
          : 0,
    };
  },

  getCustomersCount: (organizationId: string, eventId: string) =>
    prisma.customer.count({ where: { organizationId, eventId } }),

  getCardsCount: (organizationId: string, eventId: string) =>
    prisma.card.count({ where: { organizationId, eventId } }),

  // Saldo carregado (soma de recargas) vs saldo consumido (soma de vendas não canceladas)
  getBalanceFlow: async (organizationId: string, eventId: string) => {
    const [rechargesAgg, salesAgg] = await Promise.all([
      prisma.recharge.aggregate({
        where: { organizationId, eventId },
        _sum: { value: true },
      }),
      prisma.sale.aggregate({
        where: { organizationId, eventId, canceled: false },
        _sum: { total: true },
      }),
    ]);

    return {
      totalLoaded: rechargesAgg._sum.value ?? 0,
      totalConsumed: salesAgg._sum.total ?? 0,
    };
  },

  getTopProducts: async (organizationId: string, eventId: string) => {
    const grouped = await prisma.sale.groupBy({
      by: ["productId"],
      where: { organizationId, eventId, canceled: false },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const productIds = grouped.map((g) => g.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    return grouped.map((g) => ({
      product: products.find((p) => p.id === g.productId),
      quantitySold: g._sum.quantity ?? 0,
      revenue: g._sum.total ?? 0,
    }));
  },

  getTopStalls: async (organizationId: string, eventId: string) => {
    const grouped = await prisma.sale.groupBy({
      by: ["stallId"],
      where: { organizationId, eventId, canceled: false },
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    const stallIds = grouped.map((g) => g.stallId);
    const stalls = await prisma.stall.findMany({ where: { id: { in: stallIds } } });

    return grouped.map((g) => ({
      stall: stalls.find((s) => s.id === g.stallId),
      revenue: g._sum.total ?? 0,
    }));
  },

  // Vendas por hora (últimas 24h do evento)
  getSalesByHour: async (organizationId: string, eventId: string) => {
    const sales = await prisma.sale.findMany({
      where: { organizationId, eventId, canceled: false },
      select: { total: true, createdAt: true },
    });

    const byHour: Record<string, { count: number; revenue: number }> = {};

    for (const sale of sales) {
      const hour = sale.createdAt.toISOString().slice(0, 13); // "2026-07-21T19"
      if (!byHour[hour]) byHour[hour] = { count: 0, revenue: 0 };
      byHour[hour].count += 1;
      byHour[hour].revenue += Number(sale.total);
    }

    return Object.entries(byHour)
      .map(([hour, data]) => ({ hour, ...data }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  },
};