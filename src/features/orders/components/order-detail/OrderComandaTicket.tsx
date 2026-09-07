import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import type { PrintSettings } from "@/features/settings";
import { normalizePrintSettings } from "@/features/settings";
import { formatCurrency } from "@/shared/lib/format";

import { PAYMENT_METHOD_LABELS } from "./orderDetailCopy";
import { PIPELINE_LABELS } from "./orderDetailHelpers";

type OrderComandaTicketProps = {
  order: OrderAdminDetail;
  storeName: string;
  storePhone?: string | null;
  estimatedPrepTime?: number;
  printSettings?: Partial<PrintSettings> | null;
};

function formatComandaDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatAddress(address: Record<string, string>): string[] {
  const line1 = [address.street, address.number].filter(Boolean).join(", ");
  const complement = address.complement?.trim();
  const reference = address.reference?.trim();
  const line2 = [address.neighborhood, address.city, address.state]
    .filter(Boolean)
    .join(" · ");
  const lines = [line1];
  if (complement) lines.push(complement);
  if (line2) lines.push(line2);
  if (address.zip_code) lines.push(`CEP ${address.zip_code}`);
  if (reference) lines.push(`Ref: ${reference}`);
  return lines.filter(Boolean);
}

type ComandaBodyProps = {
  order: OrderAdminDetail;
  storeName: string;
  storePhone?: string | null;
  estimatedPrepTime: number;
  settings: PrintSettings;
  copyIndex: number;
  copies: number;
};

function ComandaBody({
  order,
  storeName,
  storePhone,
  estimatedPrepTime,
  settings,
  copyIndex,
  copies,
}: ComandaBodyProps) {
  const isDelivery = order.delivery_type === "delivery";
  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const paymentLabel = order.payment
    ? (PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method)
    : "—";
  const paymentStatus =
    order.payment?.status === "paid"
      ? "Pago"
      : order.payment
        ? "Pendente"
        : "—";
  const statusLabel = PIPELINE_LABELS[order.status] ?? order.status;

  return (
    <article className="comanda-copy">
      <header className="comanda-header">
        <p className="comanda-store">{storeName}</p>
        {settings.show_store_phone && storePhone ? (
          <p className="comanda-meta">Tel loja: {storePhone}</p>
        ) : null}
        <p className="comanda-title">COMANDA</p>
        <p className="comanda-number">#{order.order_number}</p>
        <p className="comanda-meta">{formatComandaDate(order.created_at)}</p>
        {copies > 1 ? (
          <p className="comanda-via">
            VIA {copyIndex}/{copies}
          </p>
        ) : null}
      </header>

      <div className="comanda-rule" />

      <p className="comanda-badge">{isDelivery ? "*** ENTREGA ***" : "*** RETIRADA ***"}</p>
      <p className="comanda-meta comanda-center">
        Situação: {statusLabel}
        {settings.show_prep_time ? ` · Prep. ~${estimatedPrepTime} min` : ""}
      </p>

      <div className="comanda-rule" />

      <section className="comanda-block">
        <p>
          <strong>Cliente:</strong> {order.customer.name}
        </p>
        {settings.show_customer_phone ? (
          <p>
            <strong>Tel:</strong> {order.customer.phone}
          </p>
        ) : null}
        {isDelivery && order.delivery_address ? (
          <div className="comanda-address">
            <p>
              <strong>Endereço:</strong>
            </p>
            {formatAddress(order.delivery_address).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : (
          <p>
            <strong>Retirada:</strong> Cliente retira no balcão
          </p>
        )}
      </section>

      <div className="comanda-rule" />

      <section className="comanda-block">
        <p className="comanda-section-title">
          ITENS ({itemsCount} {itemsCount === 1 ? "un." : "un."})
        </p>
        <ul className="comanda-items">
          {order.items.map((item) => (
            <li key={`${copyIndex}-${item.id}`} className="comanda-item">
              <div className="comanda-item-row">
                <span>
                  {item.quantity}x {item.product_name}
                </span>
                {settings.show_prices ? <span>{formatCurrency(item.total_price)}</span> : null}
              </div>
              {settings.show_prices ? (
                <p className="comanda-unit">
                  Unit. {formatCurrency(item.unit_price)}
                </p>
              ) : null}
              {item.options.length > 0 ? (
                <ul className="comanda-options">
                  {item.options.map((opt) => (
                    <li key={`${copyIndex}-${item.id}-${opt.option_group_name}-${opt.option_name}`}>
                      · {opt.option_group_name}: {opt.option_name}
                      {settings.show_prices && opt.price_modifier > 0
                        ? ` (+${formatCurrency(opt.price_modifier)})`
                        : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
              {item.notes ? <p className="comanda-obs">Obs item: {item.notes}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      {settings.show_prices ? (
        <>
          <div className="comanda-rule" />
          <section className="comanda-block comanda-totals">
            <div className="comanda-item-row">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.delivery_fee > 0 ? (
              <div className="comanda-item-row">
                <span>Taxa de entrega</span>
                <span>{formatCurrency(order.delivery_fee)}</span>
              </div>
            ) : null}
            {order.discount > 0 ? (
              <div className="comanda-item-row">
                <span>Desconto</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            ) : null}
            <div className="comanda-item-row comanda-total">
              <span>TOTAL</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </section>
        </>
      ) : null}

      {settings.show_payment ? (
        <>
          <div className="comanda-rule" />
          <section className="comanda-block">
            <p className="comanda-section-title">PAGAMENTO</p>
            <p>
              <strong>Forma:</strong> {paymentLabel}
            </p>
            <p>
              <strong>Status:</strong> {paymentStatus}
            </p>
            {order.payment?.change_for ? (
              <p>
                <strong>Troco para:</strong> {formatCurrency(order.payment.change_for)}
              </p>
            ) : null}
            {settings.show_prices ? (
              <p>
                <strong>Valor:</strong> {formatCurrency(order.payment?.amount ?? order.total)}
              </p>
            ) : null}
          </section>
        </>
      ) : null}

      {settings.show_order_notes && order.notes ? (
        <>
          <div className="comanda-rule" />
          <section className="comanda-block">
            <p className="comanda-section-title">OBS DO CLIENTE</p>
            <p className="comanda-obs">{order.notes}</p>
          </section>
        </>
      ) : null}

      {settings.show_internal_notes && order.internal_notes ? (
        <>
          <div className="comanda-rule" />
          <section className="comanda-block">
            <p className="comanda-section-title">OBS DA LOJA</p>
            <p className="comanda-obs">{order.internal_notes}</p>
          </section>
        </>
      ) : null}

      {settings.footer_text || settings.verse_text.trim() ? (
        <>
          <div className="comanda-rule" />
          {settings.footer_text ? <p className="comanda-footer">{settings.footer_text}</p> : null}
          {settings.verse_text.trim() ? (
            <p className="comanda-verse">{settings.verse_text.trim()}</p>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

/** layout estreito pra impressora térmica — só aparece no print */
export function OrderComandaTicket({
  order,
  storeName,
  storePhone,
  estimatedPrepTime = 30,
  printSettings,
}: OrderComandaTicketProps) {
  const settings = normalizePrintSettings(printSettings);
  const copies = Array.from({ length: settings.copies }, (_, index) => index + 1);

  return (
    <div
      id="order-comanda-print"
      className="order-comanda-print"
      data-paper={settings.paper_width}
      data-font={settings.font_size}
      aria-hidden="true"
    >
      {copies.map((copyIndex) => (
        <ComandaBody
          key={copyIndex}
          order={order}
          storeName={storeName}
          storePhone={storePhone}
          estimatedPrepTime={estimatedPrepTime}
          settings={settings}
          copyIndex={copyIndex}
          copies={settings.copies}
        />
      ))}
    </div>
  );
}
