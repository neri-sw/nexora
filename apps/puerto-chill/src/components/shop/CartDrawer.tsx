"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { setCartQty, submitOrder, useCart, useStore } from "@/lib/store";
import { money, paymentLabel } from "@/lib/format";
import { canInstall as installable, deliveryOptions as deliveriesFor, paymentOptions as paymentsFor, quote, shippingFor } from "@/lib/pricing";
import type { DeliveryMethod, Order, PaymentMethod } from "@/lib/types";
import { ProductVisual } from "@/components/brand";
import { IconArrowLeft, IconBag, IconCheck, IconClose, IconMinus, IconPlus, IconStore, IconTrash, IconTruck, IconLock } from "@/components/icons";

type Step = "cart" | "checkout" | "done";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, settings, content } = useStore();
  const cart = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [order, setOrder] = useState<Order | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
    .filter((l): l is { product: NonNullable<typeof l.product>; qty: number } => !!l.product);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const remaining = settings.freeShippingThreshold - subtotal;

  const close = useCallback(() => {
    if (step === "done") {
      setStep("cart");
      setOrder(null);
    }
    onClose();
  }, [step, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <button aria-label="Cerrar carrito" className="absolute inset-0 animate-fade cursor-default bg-ink/45" onClick={close} />
      <div
        ref={panel}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-[30rem] animate-drawer flex-col bg-paper-2 shadow-[-20px_0_50px_-30px_rgba(47,41,36,0.6)] focus:outline-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
          <div className="flex items-center gap-3">
            {step === "checkout" && (
              <button
                onClick={() => setStep("cart")}
                className="inline-flex size-10 items-center justify-center rounded-md border border-line hover:bg-sand"
                aria-label="Volver al carrito"
              >
                <IconArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 id="cart-title" className="font-serif text-[1.55rem] leading-none sm:text-[1.9rem]">
                {step === "checkout" ? "Finalizar compra" : step === "done" ? "¡Listo!" : "Tu carrito"}
              </h2>
              {lines.length > 0 || step === "done" ? (
                <ol className="mt-1.5 flex gap-2 text-[0.75rem] text-ink-3" aria-label="Pasos de la compra">
                  {(["cart", "checkout", "done"] as Step[]).map((s, i) => (
                    <li key={s} aria-current={step === s ? "step" : undefined} className={step === s ? "font-semibold text-ink" : ""}>
                      {i > 0 && <span aria-hidden="true" className="mr-2 text-ink-3">·</span>}
                      {s === "cart" ? "Carrito" : s === "checkout" ? "Datos" : "Listo"}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </div>
          <button
            onClick={close}
            className="inline-flex size-10 items-center justify-center rounded-md border border-line hover:bg-sand"
            aria-label="Cerrar"
          >
            <IconClose size={18} />
          </button>
        </div>

        {step === "done" && order ? (
          <Done order={order} onClose={close} address={`${content.address}, ${content.city}`} />
        ) : lines.length === 0 ? (
          <EmptyCart onClose={close} />
        ) : step === "cart" ? (
          <>
            {settings.freeShippingEnabled && settings.shippingEnabled && (
              <div className="border-b border-line px-6 py-4">
                <p className="tnum text-sm text-ink-2">
                  {remaining > 0 ? (
                    <>Te faltan <strong className="text-ink">{money(remaining)}</strong> para el envío gratis.</>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-olive-2"><IconCheck size={16} /> Tenés envío gratis.</span>
                  )}
                </p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand">
                  <div
                    className="h-full rounded-full bg-olive transition-[width] duration-500 ease-[var(--ease-out-quint)]"
                    style={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            <ul className="flex-1 overflow-y-auto px-6">
              {lines.map(({ product: p, qty }) => (
                <li key={p.id} className="flex gap-4 border-b border-line py-5 last:border-0">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-sand">
                    <ProductVisual product={p} sizes="80px" framed />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-serif text-[1.05rem] leading-snug">{p.name}</p>
                      <button
                        onClick={() => setCartQty(p.id, 0)}
                        className="-mt-1 -mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink-3 hover:bg-sand hover:text-danger"
                        aria-label={`Quitar ${p.name}`}
                      >
                        <IconTrash size={17} />
                      </button>
                    </div>
                    <p className="tnum text-sm text-ink-2">{money(p.price)} c/u</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <Stepper value={qty} max={p.stock} onChange={(q) => setCartQty(p.id, q)} label={p.name} />
                      <span className="tnum font-semibold">{money(p.price * qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line bg-paper px-6 py-5">
              <div className="tnum flex items-baseline justify-between">
                <span className="text-ink-2">Subtotal</span>
                <span className="font-serif text-2xl">{money(subtotal)}</span>
              </div>
              {settings.financingEnabled && settings.installments > 1 && (
                <p className="tnum mt-1 text-right text-sm text-olive">
                  o {settings.installments} cuotas sin interés de {money(subtotal / settings.installments)}
                </p>
              )}
              <button
                onClick={() => setStep("checkout")}
                className="mt-4 w-full rounded-md bg-olive px-5 py-3.5 font-medium text-paper transition-colors hover:bg-olive-2"
              >
                Continuar compra
              </button>
              <button onClick={close} className="mt-2 w-full rounded-md px-5 py-3 text-ink-2 hover:bg-sand">
                Seguir mirando
              </button>
            </div>
          </>
        ) : (
          <Checkout
            subtotal={subtotal}
            lines={lines}
            onDone={(o) => {
              setOrder(o);
              setStep("done");
            }}
          />
        )}
      </div>
    </div>
  );
}

function Stepper({ value, max, onChange, label }: { value: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center rounded-md border border-line bg-paper-2">
      <button
        onClick={() => onChange(value - 1)}
        className="inline-flex size-9 items-center justify-center rounded-l-md text-ink hover:bg-sand"
        aria-label={`Quitar uno de ${label}`}
      >
        <IconMinus size={16} />
      </button>
      <span className="tnum w-8 text-center text-sm font-semibold" aria-live="polite">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="inline-flex size-9 items-center justify-center rounded-r-md text-ink hover:bg-sand disabled:cursor-not-allowed disabled:text-ink-3/50 disabled:hover:bg-transparent"
        aria-label={`Sumar uno de ${label}`}
        title={value >= max ? "No hay más stock" : undefined}
      >
        <IconPlus size={16} />
      </button>
    </div>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-sand text-olive">
        <IconBag size={28} />
      </span>
      <p className="mt-5 font-serif text-2xl">Tu carrito está vacío</p>
      <p className="mt-2 max-w-xs text-ink-2">Sumá lo que te guste desde el catálogo. Lo guardamos mientras mirás.</p>
      <button onClick={onClose} className="mt-6 rounded-md bg-olive px-5 py-3 font-medium text-paper hover:bg-olive-2">
        Ver productos
      </button>
    </div>
  );
}

type Line = { product: { id: string; name: string; price: number }; qty: number };

function Checkout({ subtotal, lines, onDone }: { subtotal: number; lines: Line[]; onDone: (o: Order) => void }) {
  const { settings } = useStore();
  const deliveryOptions = deliveriesFor(settings);
  const [delivery, setDelivery] = useState<DeliveryMethod>(deliveryOptions[0] ?? "retiro");
  const paymentOptions = paymentsFor(settings, delivery);
  const [chosenPayment, setPayment] = useState<PaymentMethod>(paymentOptions[0] ?? "mercadopago");
  const payment = paymentOptions.includes(chosenPayment) ? chosenPayment : (paymentOptions[0] ?? "mercadopago");
  const [installments, setInstallments] = useState(settings.financingEnabled ? settings.installments : 1);
  const [f, setF] = useState({ name: "", email: "", phone: "", address: "", city: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState("");

  // mismo cálculo que hace el servidor al registrar el pedido (src/lib/pricing.ts)
  const { shipping, discount, total } = quote(
    lines.map((l) => ({ price: l.product.price, qty: l.qty })),
    delivery,
    payment,
    installments,
    settings,
  );
  const canInstall = installable(settings, payment);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (f.name.trim().length < 3) err.name = "Escribí tu nombre y apellido.";
    if (f.phone.replace(/\D/g, "").length < 8) err.phone = "Necesitamos tu teléfono para coordinar el pago y la entrega.";
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email)) err.email = "Revisá el correo: falta algo (ej. nombre@mail.com).";
    if (delivery === "envio" && f.address.trim().length < 4) err.address = "Necesitamos la dirección para el envío.";
    if (delivery === "envio" && f.city.trim().length < 2) err.city = "Indicá la localidad.";
    setErrors(err);
    setFailure("");
    if (Object.keys(err).length) return;
    setSending(true);
    const customer = { name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), address: f.address.trim(), city: f.city.trim() };
    const r = await submitOrder({
      items: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
      customer,
      delivery,
      payment,
      installments: canInstall ? installments : 1,
      website: f.website,
    });
    setSending(false);
    if (!r.ok) {
      if (r.status === 409 && r.items) {
        // se ajusta el carrito al stock real y se avisa qué cambió
        r.items.forEach((x) => setCartQty(x.productId, x.available));
        setFailure(`Nos quedamos sin stock suficiente: ${r.items.map((x) => (x.available ? `${x.name} (quedan ${x.available})` : `${x.name} (agotado)`)).join(", ")}. Ajustamos tu carrito.`);
      } else if (r.field && r.field in f) {
        setErrors({ [r.field]: r.error });
      } else {
        setFailure(r.error);
      }
      return;
    }
    const o = r.order;
    onDone({
      ...o,
      createdAt: new Date().toISOString(),
      status: "pendiente",
      customer: { ...customer, ...(delivery === "envio" ? {} : { address: undefined, city: undefined }) },
    });
  };

  const field = (k: keyof typeof f, label: string, type = "text", autoComplete?: string) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={f[k]}
        autoComplete={autoComplete}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
        aria-invalid={!!errors[k]}
        className={`w-full rounded-md border bg-paper-2 px-3.5 py-3 text-ink focus:outline-none ${
          errors[k] ? "border-danger focus:border-danger" : "border-line focus:border-olive"
        }`}
      />
      {errors[k] && <span className="mt-1.5 block text-sm text-danger">{errors[k]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
        <fieldset className="space-y-4">
          <legend className="mb-3 font-serif text-xl">Tus datos</legend>
          {field("name", "Nombre y apellido", "text", "name")}
          {field("email", "Correo electrónico (opcional)", "email", "email")}
          {field("phone", "Teléfono / WhatsApp", "tel", "tel")}
          {/* campo trampa para bots: las personas no lo ven */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={f.website}
            onChange={(e) => setF({ ...f, website: e.target.value })}
            className="absolute -left-[9999px] size-px opacity-0"
          />
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-serif text-xl">Entrega</legend>
          <div className="grid gap-2.5">
            {deliveryOptions.map((d) => (
              <Choice
                key={d}
                name="delivery"
                checked={delivery === d}
                onChange={() => setDelivery(d)}
                icon={d === "retiro" ? <IconStore size={20} /> : <IconTruck size={20} />}
                title={d === "retiro" ? "Retiro en el local" : "Envío a domicilio"}
                note={
                  d === "retiro"
                    ? "Sin cargo · Te avisamos cuando está listo"
                    : shippingFor(subtotal, settings) === 0
                      ? "Gratis para esta compra"
                      : `${money(settings.shippingCost)} · a todo el país`
                }
              />
            ))}
          </div>
          {delivery === "envio" && (
            <div className="mt-4 grid animate-rise gap-4 sm:grid-cols-[1.4fr_1fr]">
              {field("address", "Dirección", "text", "street-address")}
              {field("city", "Localidad", "text", "address-level2")}
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-serif text-xl">Pago</legend>
          <div className="grid gap-2.5">
            {paymentOptions.map((m) => (
              <Choice
                key={m}
                name="payment"
                checked={payment === m}
                onChange={() => setPayment(m)}
                title={paymentLabel[m]}
                note={
                  m === "transferencia" && settings.transferDiscount > 0
                    ? `${settings.transferDiscount}% de descuento`
                    : m === "mercadopago" && settings.financingEnabled
                      ? `Hasta ${settings.installments} cuotas sin interés`
                      : m === "efectivo"
                        ? "Pagás cuando retirás"
                        : undefined
                }
              />
            ))}
          </div>
          {canInstall && (
            <label className="mt-4 block animate-rise">
              <span className="mb-1.5 block text-sm font-medium">Cuotas</span>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="tnum w-full rounded-md border border-line bg-paper-2 px-3.5 py-3 focus:border-olive focus:outline-none"
              >
                {Array.from({ length: settings.installments }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n === 1 ? `1 pago de ${money(total)}` : `${n} cuotas sin interés de ${money(total / n)}`}
                  </option>
                ))}
              </select>
            </label>
          )}
        </fieldset>
      </div>

      <div className="on-dark bg-forest px-6 py-5 text-paper">
        <dl className="tnum space-y-1.5 text-sm text-forest-ink">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
          {delivery === "envio" && (
            <div className="flex justify-between"><dt>Envío</dt><dd>{shipping === 0 ? "Gratis" : money(shipping)}</dd></div>
          )}
          {discount > 0 && (
            <div className="flex justify-between"><dt>Descuento transferencia</dt><dd>−{money(discount)}</dd></div>
          )}
          <div className="flex items-baseline justify-between pt-2 text-paper">
            <dt className="text-base">Total</dt>
            <dd className="font-serif text-[1.75rem]">{money(total)}</dd>
          </div>
        </dl>
        <p role={failure ? "alert" : undefined} className={`mt-3 flex items-start gap-2 text-[0.8rem] ${failure ? "text-paper" : "text-forest-ink"}`}>
          <IconLock size={15} className="mt-0.5 shrink-0" />
          {failure || "No se cobra nada online: te contactamos para coordinar el pago y la entrega."}
        </p>
        <button
          type="submit"
          disabled={sending}
          className="mt-4 inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-paper px-5 py-3.5 font-medium text-forest transition-colors hover:bg-sand disabled:cursor-wait disabled:opacity-80"
        >
          {sending ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-forest/25 border-t-forest" />
              Registrando pedido…
            </>
          ) : (
            "Confirmar pedido"
          )}
        </button>
      </div>
    </form>
  );
}

function Choice({
  name,
  checked,
  onChange,
  title,
  note,
  icon,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  note?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3.5 rounded-md border px-4 py-3.5 transition-colors ${
        checked ? "border-olive bg-olive-soft/60" : "border-line bg-paper-2 hover:border-sand-2"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="size-4 shrink-0" />
      {icon && <span className={checked ? "text-olive-2" : "text-ink-3"}>{icon}</span>}
      <span className="flex-1">
        <span className="block font-medium">{title}</span>
        {note && <span className="block text-sm text-ink-2">{note}</span>}
      </span>
    </label>
  );
}

function Done({ order, onClose, address }: { order: Order; onClose: () => void; address: string }) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
      <span className="inline-flex size-14 animate-rise items-center justify-center rounded-full bg-olive text-paper">
        <IconCheck size={28} />
      </span>
      <p className="mt-6 font-serif text-[1.9rem] leading-tight">
        ¡Listo! Tu pedido <span className="tnum">#{String(order.id).padStart(4, "0")}</span> quedó registrado.
      </p>
      <p className="mt-3 text-ink-2">
        Te vamos a contactar para coordinar el pago y la entrega.{" "}
        {order.delivery === "retiro"
          ? `Lo retirás en ${address}.`
          : `Lo enviamos a ${order.customer.address}, ${order.customer.city}.`}
      </p>

      <div className="mt-7 rounded-md border border-line bg-paper p-5">
        <ul className="space-y-2 text-sm">
          {order.lines.map((l) => (
            <li key={l.productId} className="tnum flex justify-between gap-4">
              <span className="text-ink-2">{l.qty} × {l.name}</span>
              <span>{money(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="tnum mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-ink-2">Total</span>
          <span className="font-serif text-2xl">{money(order.total)}</span>
        </div>
        <p className="mt-1 text-right text-sm text-ink-3">
          {paymentLabel[order.payment]}
          {order.installments > 1 && ` · ${order.installments} cuotas`}
        </p>
      </div>

      <div className="mt-auto grid gap-2 pt-8">
        <button onClick={onClose} className="rounded-md bg-olive px-5 py-3.5 font-medium text-paper hover:bg-olive-2">
          Seguir comprando
        </button>
      </div>
    </div>
  );
}
