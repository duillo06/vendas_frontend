import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";

/** labels do botão principal — o que o operador toca agora */
export const PRIMARY_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  confirmed: "Aceitar pedido",
  preparing: "Iniciar preparo",
  ready: "Pedido pronto",
  out_for_delivery: "Saiu para entrega",
  completed: "Concluir pedido",
  cancelled: "Cancelar pedido",
};

export const SECONDARY_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  completed: "Concluir (retirada)",
  out_for_delivery: "Saiu para entrega",
  cancelled: "Cancelar",
};

type NowCard = {
  title: string;
  body: string;
  emotion: string;
};

export function getNowCardCopy(order: OrderAdminDetail): NowCard {
  const isDelivery = order.delivery_type === "delivery";

  switch (order.status) {
    case "pending":
      return {
        title: "O que fazer agora",
        body: "Pedido novo na fila. Confirme para avisar a cozinha e o cliente.",
        emotion: "Vamos começar!",
      };
    case "confirmed":
      return {
        title: "O que fazer agora",
        body: "Este pedido já foi confirmado. Agora envie para a produção.",
        emotion: "Hora de colocar a mão na massa.",
      };
    case "preparing":
      return {
        title: "O que fazer agora",
        body: "A cozinha está trabalhando. Marque como pronto quando finalizar.",
        emotion: "Foco no sabor — tá saindo!",
      };
    case "ready":
      return {
        title: "O que fazer agora",
        body: isDelivery
          ? "Pedido montado. Agora entregue ao entregador."
          : "Pedido pronto na bancada. Aguarde o cliente ou conclua a retirada.",
        emotion: isDelivery ? "O entregador já pode sair." : "Cliente quase na porta.",
      };
    case "out_for_delivery":
      return {
        title: "O que fazer agora",
        body: "Pedido a caminho. Conclua quando chegar ao cliente.",
        emotion: "Mais um cliente quase feliz.",
      };
    case "completed":
      return {
        title: "Pedido concluído",
        body: "Bom trabalho! Mais um cliente atendido com carinho.",
        emotion: "Excelente operação.",
      };
    case "cancelled":
      return {
        title: "Pedido cancelado",
        body: "Este pedido foi encerrado. Não há mais ações pendentes.",
        emotion: "Sigamos para o próximo.",
      };
    default:
      return {
        title: "O que fazer agora",
        body: "Acompanhe o status e avance quando estiver pronto.",
        emotion: "Você no comando.",
      };
  }
}

export function getLiveTimerCopy(
  order: OrderAdminDetail,
  minutesInStatus: number,
  totalMinutes: number,
): { label: string; detail: string } {
  const elapsed =
    minutesInStatus < 1
      ? "instantes"
      : minutesInStatus === 1
        ? "1 minuto"
        : `${minutesInStatus} minutos`;

  switch (order.status) {
    case "pending":
      return { label: "Aguardando confirmação", detail: `há ${elapsed}` };
    case "confirmed":
      return { label: "Confirmado", detail: `há ${elapsed}` };
    case "preparing":
      return { label: "Em preparo", detail: `há ${elapsed}` };
    case "ready":
      return { label: "Pronto", detail: `há ${elapsed}` };
    case "out_for_delivery":
      return { label: "Saiu para entrega", detail: `há ${elapsed}` };
    case "completed":
      return {
        label: "Finalizado",
        detail: totalMinutes <= 1 ? "em cerca de 1 minuto" : `em ${totalMinutes} minutos`,
      };
    case "cancelled":
      return { label: "Cancelado", detail: `após ${elapsed}` };
    default:
      return { label: "Pedido criado", detail: `há ${elapsed}` };
  }
}

export function eventLabel(toStatus: string): string {
  const map: Record<string, string> = {
    pending: "Pedido recebido",
    confirmed: "Pedido confirmado",
    preparing: "Preparo iniciado",
    ready: "Pedido pronto",
    out_for_delivery: "Saiu para entrega",
    completed: "Pedido concluído",
    cancelled: "Pedido cancelado",
  };
  return map[toStatus] ?? toStatus;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  pix: "PIX",
  card_on_delivery: "Cartão na entrega",
};
