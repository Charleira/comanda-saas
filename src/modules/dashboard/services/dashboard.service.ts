import { dashboardRepository } from "../repositories/dashboard.repository";
import { TenantContext, assertRole } from "@/lib/tenant-context";

export const dashboardService = {
  getOverview: async (ctx: TenantContext, eventId: string) => {
    // Regra do PDF: operador nunca visualiza relatórios financeiros
    assertRole(ctx, ["ADMIN", "CASHIER"]);

    const [salesSummary, customersCount, cardsCount, balanceFlow, topProducts, topStalls, salesByHour] =
      await Promise.all([
        dashboardRepository.getSalesSummary(ctx.organizationId, eventId),
        dashboardRepository.getCustomersCount(ctx.organizationId, eventId),
        dashboardRepository.getCardsCount(ctx.organizationId, eventId),
        dashboardRepository.getBalanceFlow(ctx.organizationId, eventId),
        dashboardRepository.getTopProducts(ctx.organizationId, eventId),
        dashboardRepository.getTopStalls(ctx.organizationId, eventId),
        dashboardRepository.getSalesByHour(ctx.organizationId, eventId),
      ]);

    return {
      revenue: {
        today: salesSummary.todayRevenue,
        total: salesSummary.totalRevenue,
        averageTicket: salesSummary.averageTicket,
      },
      customersCount,
      cardsCount,
      balance: {
        loaded: balanceFlow.totalLoaded,
        consumed: balanceFlow.totalConsumed,
      },
      topProducts,
      topStalls,
      salesByHour,
    };
  },
};