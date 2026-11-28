"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  addProduct,
  removeProduct,
  resetDemo,
  updateContent,
  updateOrderStatus,
  updateOrderNote,
  updateProduct,
  updateSettings,
  useStore,
} from "@/lib/store";
import { panelBase } from "@/lib/admin-client";
import { categoryLabel, dateTime, installmentLine, money, paymentLabel, statusLabel, whatsappTo } from "@/lib/format";
import type { ArtKind, CategoryId, Order, OrderStatus, PaymentMethod, Product } from "@/lib/types";
import { Logo, ProductVisual } from "@/components/brand";
import {
  IconBox,
  IconCheck,
  IconExternal,
  IconEye,
  IconEyeOff,
  IconHome,
  IconMinus,
  IconPlus,
  IconReceipt,
  IconRefresh,
  IconSliders,
  IconStar,
  IconStore,
  IconText,
  IconTrash,
  IconTruck,
} from "@/components/icons";
import { NumberField, Panel, Switch, TextField } from "./ui";
import { PhotoInput } from "./PhotoInput";

type Tab = "resumen" | "productos" | "pedidos" | "ventas" | "contenido";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "resumen", label: "Resumen", icon: <IconHome size={19} /> },
  { id: "productos", label: "Productos", icon: <IconBox size={19} /> },
  { id: "pedidos", label: "Pedidos", icon: <IconReceipt size={19} /> },
  { id: "ventas", label: "Envíos y pagos", icon: <IconSliders size={19} /> },
  { id: "contenido", label: "Textos del sitio", icon: <IconText size={19} /> },
];

export function Admin() {
  const store = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("tab");
  const tab: Tab = tabs.some((x) => x.id === q) ? (q as Tab) : "resumen";
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  const go = (t: Tab) => {
    router.replace(t === "resumen" ? panelBase() : `${panelBase()}?tab=${t}`, { scroll: false });
    window.scrollTo({ top: 0 });
  };

  const saved = (text = "Cambios guardados") => setToast({ id: Date.now(), text });
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const pending = store.orders.filter((o) => o.status === "pendiente").length;

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[16.5rem_1fr]">
      {/* Barra lateral */}
      <aside className="on-dark sticky top-0 z-30 bg-forest text-paper lg:h-dvh">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
            <Link href="/" aria-label="Ver la tienda" className="flex items-center gap-3 rounded-full">
              <Logo className="size-14 lg:size-16" />
              <span className="flex flex-col leading-none">
                <span className="font-serif text-[1.2rem] tracking-[-0.01em] text-paper">Panel</span>
                <span className="mt-1 text-[0.72rem] text-forest-ink">Puerto Chill</span>
              </span>
            </Link>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-1.5 rounded-md border border-paper/25 px-3 py-2 text-sm text-paper hover:bg-paper/10 lg:hidden"
            >
              Tienda <IconExternal size={15} />
            </Link>
          </div>
          <nav aria-label="Secciones del panel" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-[0.95rem] transition-colors ${
                  tab === t.id ? "bg-paper text-forest" : "text-forest-ink hover:bg-paper/10 hover:text-paper"
                }`}
              >
                {t.icon}
                {t.label}
                {t.id === "pedidos" && pending > 0 && (
                  <span className={`tnum ml-auto rounded-full px-2 py-0.5 text-[0.72rem] font-semibold ${tab === t.id ? "bg-forest text-paper" : "bg-kraft text-ink"}`}>
                    {pending}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-auto hidden space-y-1 border-t border-paper/15 p-3 lg:block">
            <Link href="/tienda" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.95rem] text-forest-ink hover:bg-paper/10 hover:text-paper">
              <IconStore size={19} /> Ver la tienda <IconExternal size={14} className="ml-auto" />
            </Link>
            {!IS_PROD && <ResetButton onDone={() => saved("Demo restablecida")} />}
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-6xl">
          {tab === "resumen" && <Overview go={go} saved={saved} />}
          {tab === "productos" && <Products saved={saved} />}
          {tab === "pedidos" && <Orders saved={saved} />}
          {tab === "ventas" && <SalesSettings saved={saved} />}
          {tab === "contenido" && <ContentEditor saved={saved} />}
          {!IS_PROD && (
            <div className="mt-12 lg:hidden">
              <ResetButton onDone={() => saved("Demo restablecida")} light />
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="fixed bottom-5 left-1/2 z-50 inline-flex -translate-x-1/2 animate-rise items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm text-paper shadow-[0_12px_30px_-12px_rgba(47,41,36,0.7)]"
        >
          <IconCheck size={17} className="text-olive-soft" /> {toast.text}
        </div>
      )}
    </div>
  );
}

/** En producción no se ofrece "Restablecer demo" (borraría pedidos reales). */
const IS_PROD = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

function PageHead({ title, text, actions }: { title: string; text: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[2.25rem] leading-tight tracking-[-0.015em]">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-ink-2">{text}</p>
      </div>
      {actions}
    </div>
  );
}

function ResetButton({ onDone, light }: { onDone: () => void; light?: boolean }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm)
    return (
      <div className={`rounded-md p-3 text-sm ${light ? "border border-line bg-paper-2 text-ink" : "bg-paper/10 text-paper"}`}>
        <p>Se borran pedidos y cambios, y vuelven los datos de ejemplo.</p>
        <div className="mt-2.5 flex gap-2">
          <button
            onClick={() => {
              resetDemo();
              setConfirm(false);
              onDone();
            }}
            className="rounded-md bg-danger px-3 py-1.5 font-medium text-paper"
          >
            Restablecer
          </button>
          <button onClick={() => setConfirm(false)} className={`rounded-md px-3 py-1.5 ${light ? "hover:bg-sand" : "hover:bg-paper/10"}`}>
            Cancelar
          </button>
        </div>
      </div>
    );
  return (
    <button
      onClick={() => setConfirm(true)}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[0.95rem] ${
        light ? "border border-line text-ink-2 hover:bg-sand" : "text-forest-ink hover:bg-paper/10 hover:text-paper"
      }`}
    >
      <IconRefresh size={19} /> Restablecer demo
    </button>
  );
}

/* ---------------- Resumen ---------------- */

function Overview({ go, saved }: { go: (t: Tab) => void; saved: (t?: string) => void }) {
  const { orders, products, settings } = useStore();
  const valid = orders.filter((o) => o.status !== "cancelado");
  const sales = valid.reduce((s, o) => s + o.total, 0);
  const lowStock = products.filter((p) => p.stock <= settings.lowStockThreshold).sort((a, b) => a.stock - b.stock);
  const units = valid.reduce((s, o) => s + o.lines.reduce((a, l) => a + l.qty, 0), 0);
  const pendingCount = orders.filter((o) => o.status === "pendiente").length;
  const outCount = products.filter((p) => p.stock === 0).length;
  const lowCount = lowStock.length - outCount;

  return (
    <>
      <PageHead title="Hola, Puerto Chill" text="Así está la tienda hoy. Los pedidos que se hagan en la tienda aparecen acá." />

      {/* Lo que pide atención primero */}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 rounded-md border border-line bg-paper-2 px-5 py-5">
        <p className="font-serif text-[1.6rem] leading-tight">
          {pendingCount === 0 && outCount === 0 && lowCount === 0 ? (
            "Todo en orden por ahora."
          ) : (
            <>
              {[
                pendingCount > 0 && `${pendingCount} ${pendingCount === 1 ? "pedido pendiente" : "pedidos pendientes"}`,
                outCount > 0 && `${outCount} sin stock`,
                lowCount > 0 && `${lowCount} con stock bajo`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </>
          )}
        </p>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <button onClick={() => go("pedidos")} className="rounded-md bg-olive px-3.5 py-2 text-sm font-medium text-paper hover:bg-olive-2">
              Ver pedidos
            </button>
          )}
          {outCount + lowCount > 0 && (
            <button onClick={() => go("productos")} className="rounded-md bg-sand px-3.5 py-2 text-sm font-medium text-ink hover:bg-sand-2">
              Reponer stock
            </button>
          )}
        </div>
      </div>

      <dl className="tnum mt-3 flex flex-wrap gap-x-8 gap-y-2 px-1 text-sm text-ink-2">
        {[
          ["Pedidos", String(orders.length)],
          ["Ventas", money(sales)],
          ["Unidades vendidas", String(units)],
          ["Publicados", `${products.filter((p) => p.visible).length} de ${products.length}`],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-1.5">
            <dt>{k}:</dt>
            <dd className="font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel
          title="Últimos pedidos"
          actions={
            <button onClick={() => go("pedidos")} className="text-sm font-medium text-olive hover:underline">
              Ver todos
            </button>
          }
        >
          {orders.length === 0 ? (
            <div className="py-8">
              <p className="font-medium">Todavía no hay pedidos.</p>
              <p className="mt-1 text-sm text-ink-2">
                Cuando alguien compre en la tienda lo vas a ver acá, con su estado.
              </p>
              <Link href="/tienda" className="mt-4 inline-flex items-center gap-2 rounded-md bg-olive px-4 py-2.5 text-sm font-medium text-paper hover:bg-olive-2">
                Ir a la tienda <IconExternal size={15} />
              </Link>
            </div>
          ) : (
            <ul>
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="tnum flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-0">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">#{String(o.id).padStart(4, "0")} · {o.customer.name}</span>
                    <span className="block text-sm text-ink-3">{dateTime(o.createdAt)} · {o.delivery === "retiro" ? "Retiro" : "Envío"}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <StatusPill status={o.status} />
                    <span className="w-24 text-right font-semibold">{money(o.total)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Stock bajo" description={`Productos con ${settings.lowStockThreshold} unidades o menos.`}>
            {lowStock.length === 0 ? (
              <p className="py-5 text-sm text-ink-2">Todo con stock suficiente.</p>
            ) : (
              <ul>
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
                    <span className="truncate">{p.name}</span>
                    <span className={`tnum shrink-0 rounded-sm px-2 py-0.5 text-sm font-semibold ${p.stock === 0 ? "bg-danger-soft text-danger" : "bg-sand text-ink"}`}>
                      {p.stock === 0 ? "Sin stock" : `${p.stock} u.`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Atajos de venta">
            <Switch
              label="Envío gratis"
              description={`Desde ${money(settings.freeShippingThreshold)}`}
              checked={settings.freeShippingEnabled}
              onChange={(v) => {
                updateSettings({ freeShippingEnabled: v });
                saved(v ? "Envío gratis activado" : "Envío gratis desactivado");
              }}
            />
            <div className="border-t border-line" />
            <Switch
              label="Cuotas sin interés"
              description={`${settings.installments} cuotas con Mercado Pago`}
              checked={settings.financingEnabled}
              onChange={(v) => {
                updateSettings({ financingEnabled: v });
                saved(v ? "Cuotas activadas" : "Cuotas desactivadas");
              }}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}

/* ---------------- Productos ---------------- */

function Products({ saved }: { saved: (t?: string) => void }) {
  const { products, settings } = useStore();
  const [adding, setAdding] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [cat, setCat] = useState<"todos" | CategoryId>("todos");
  const list = products.filter((p) => cat === "todos" || p.category === cat);

  return (
    <>
      <PageHead
        title="Productos"
        text="Precios, stock y qué se muestra en la tienda. Los cambios se guardan al salir de cada campo."
        actions={
          !adding && (
            <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-md bg-olive px-4 py-2.5 font-medium text-paper hover:bg-olive-2">
              <IconPlus size={18} /> Nuevo producto
            </button>
          )
        }
      />

      {adding && (
        <NewProduct
          onCancel={() => setAdding(false)}
          onSave={(p) => {
            addProduct(p);
            setAdding(false);
            saved("Producto creado");
          }}
        />
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["todos", "bazar", "bolsos"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-md px-3.5 py-2 text-sm transition-colors ${cat === c ? "bg-olive text-paper" : "bg-sand text-ink hover:bg-sand-2"}`}
          >
            {c === "todos" ? "Todos" : categoryLabel[c]}
          </button>
        ))}
      </div>

      <ul className="space-y-3 md:hidden">
        {list.map((p) => (
          <MobileProductRow
            key={p.id}
            product={p}
            lowThreshold={settings.lowStockThreshold}
            saved={saved}
            confirming={confirmDel === p.id}
            onAskDelete={() => setConfirmDel(p.id)}
            onCancelDelete={() => setConfirmDel(null)}
          />
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-md border border-line bg-paper-2 md:block">
        <table className="w-full min-w-[52rem] text-left">
          <thead className="border-b border-line text-sm text-ink-2">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-3 py-3 font-medium">Precio</th>
              <th className="px-3 py-3 font-medium">Precio anterior</th>
              <th className="px-3 py-3 font-medium">Stock</th>
              <th className="px-3 py-3 text-center font-medium">En tienda</th>
              <th className="px-3 py-3 text-center font-medium">Destacado</th>
              <th className="px-3 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className={`border-b border-line last:border-0 ${!p.visible ? "bg-paper" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <PhotoInput
                      label={`Cambiar foto de ${p.name}`}
                      onUploaded={(url) => {
                        updateProduct(p.id, { image: url, imagePosition: undefined });
                        saved("Foto actualizada");
                      }}
                      onError={saved}
                      className={`size-12 shrink-0 overflow-hidden rounded-sm bg-sand ring-olive hover:ring-2 ${!p.visible ? "opacity-50" : ""}`}
                    >
                      <ProductVisual product={p} sizes="48px" />
                    </PhotoInput>
                    <div className="min-w-0">
                      <p className={`truncate font-medium ${!p.visible ? "text-ink-3" : ""}`}>{p.name}</p>
                      <p className="text-sm text-ink-3">{categoryLabel[p.category]}{!p.visible && " · Oculto"}</p>
                    </div>
                  </div>
                </td>
                <td className="w-36 px-3 py-3">
                  <NumberField
                    hideLabel
                    label={`Precio de ${p.name}`}
                    prefix="$"
                    thousands
                    value={p.price}
                    onCommit={(n) => {
                      updateProduct(p.id, { price: n });
                      saved("Precio actualizado");
                    }}
                  />
                </td>
                <td className="w-36 px-3 py-3">
                  <NumberField
                    hideLabel
                    label={`Precio anterior de ${p.name}`}
                    prefix="$"
                    thousands
                    value={p.compareAt ?? 0}
                    emptyIsZero
                    placeholder="Sin descuento"
                    onCommit={(n) => {
                      updateProduct(p.id, { compareAt: n || undefined });
                      saved(n ? "Descuento aplicado" : "Descuento quitado");
                    }}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-md border border-line bg-paper-2">
                      <button
                        className="inline-flex size-9 items-center justify-center rounded-l-md hover:bg-sand disabled:text-ink-3/40"
                        disabled={p.stock <= 0}
                        onClick={() => updateProduct(p.id, { stock: p.stock - 1 })}
                        aria-label={`Restar stock de ${p.name}`}
                      >
                        <IconMinus size={15} />
                      </button>
                      <span className="tnum w-9 text-center text-sm font-semibold">{p.stock}</span>
                      <button
                        className="inline-flex size-9 items-center justify-center rounded-r-md hover:bg-sand"
                        onClick={() => updateProduct(p.id, { stock: p.stock + 1 })}
                        aria-label={`Sumar stock de ${p.name}`}
                      >
                        <IconPlus size={15} />
                      </button>
                    </div>
                    {p.stock === 0 ? (
                      <span className="rounded-sm bg-danger-soft px-1.5 py-0.5 text-[0.72rem] font-semibold text-danger">Agotado</span>
                    ) : p.stock <= settings.lowStockThreshold ? (
                      <span className="rounded-sm bg-sand px-1.5 py-0.5 text-[0.72rem] font-semibold text-ink-2">Bajo</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <IconToggle
                    on={p.visible}
                    onClick={() => {
                      updateProduct(p.id, { visible: !p.visible });
                      saved(p.visible ? "Producto oculto" : "Producto publicado");
                    }}
                    label={p.visible ? `Ocultar ${p.name}` : `Mostrar ${p.name}`}
                    iconOn={<IconEye size={19} />}
                    iconOff={<IconEyeOff size={19} />}
                  />
                </td>
                <td className="px-3 py-3 text-center">
                  <IconToggle
                    on={p.featured}
                    onClick={() => updateProduct(p.id, { featured: !p.featured })}
                    label={p.featured ? `Quitar ${p.name} de destacados` : `Destacar ${p.name}`}
                    iconOn={<IconStar size={19} fill="currentColor" />}
                    iconOff={<IconStar size={19} />}
                  />
                </td>
                <td className="px-3 py-3 text-right">
                  {confirmDel === p.id ? (
                    <span className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          removeProduct(p.id);
                          setConfirmDel(null);
                          saved("Producto eliminado");
                        }}
                        className="rounded-md bg-danger px-2.5 py-1.5 text-sm font-medium text-paper"
                      >
                        Eliminar
                      </button>
                      <button onClick={() => setConfirmDel(null)} className="rounded-md px-2.5 py-1.5 text-sm hover:bg-sand">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDel(p.id)}
                      className="inline-flex size-9 items-center justify-center rounded-md text-ink-3 hover:bg-danger-soft hover:text-danger"
                      aria-label={`Eliminar ${p.name}`}
                    >
                      <IconTrash size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-ink-3">
        Con un precio anterior mayor al actual, la tienda muestra el porcentaje de descuento.
      </p>
    </>
  );
}

function MobileProductRow({
  product: p,
  lowThreshold,
  saved,
  confirming,
  onAskDelete,
  onCancelDelete,
}: {
  product: Product;
  lowThreshold: number;
  saved: (t?: string) => void;
  confirming: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
}) {
  const [more, setMore] = useState(false);
  return (
    <li className={`rounded-md border border-line ${p.visible ? "bg-paper-2" : "bg-paper"} p-4`}>
      <div className="flex items-center gap-3">
        <PhotoInput
          label={`Cambiar foto de ${p.name}`}
          onUploaded={(url) => {
            updateProduct(p.id, { image: url, imagePosition: undefined });
            saved("Foto actualizada");
          }}
          onError={saved}
          className={`size-12 shrink-0 overflow-hidden rounded-sm bg-sand ring-olive hover:ring-2 ${!p.visible ? "opacity-50" : ""}`}
        >
          <ProductVisual product={p} sizes="48px" />
        </PhotoInput>
        <div className="min-w-0 flex-1">
          <p className={`truncate font-medium ${!p.visible ? "text-ink-3" : ""}`}>{p.name}</p>
          <p className="text-sm text-ink-3">
            {categoryLabel[p.category]}
            {!p.visible && " · Oculto"}
            {p.stock === 0 ? " · Agotado" : p.stock <= lowThreshold ? " · Stock bajo" : ""}
          </p>
        </div>
        <IconToggle
          on={p.visible}
          onClick={() => {
            updateProduct(p.id, { visible: !p.visible });
            saved(p.visible ? "Producto oculto" : "Producto publicado");
          }}
          label={p.visible ? `Ocultar ${p.name}` : `Mostrar ${p.name}`}
          iconOn={<IconEye size={19} />}
          iconOff={<IconEyeOff size={19} />}
        />
      </div>
      <div className="mt-3 flex items-end gap-3">
        <NumberField
          label="Precio"
          prefix="$"
          thousands
          value={p.price}
          className="flex-1"
          onCommit={(n) => {
            updateProduct(p.id, { price: n });
            saved("Precio actualizado");
          }}
        />
        <div>
          <span className="mb-1.5 block text-sm font-medium">Stock</span>
          <div className="inline-flex items-center rounded-md border border-line bg-paper-2">
            <button
              className="inline-flex size-11 items-center justify-center rounded-l-md hover:bg-sand disabled:text-ink-3/40"
              disabled={p.stock <= 0}
              onClick={() => updateProduct(p.id, { stock: p.stock - 1 })}
              aria-label={`Restar stock de ${p.name}`}
            >
              <IconMinus size={16} />
            </button>
            <span className="tnum w-9 text-center font-semibold">{p.stock}</span>
            <button
              className="inline-flex size-11 items-center justify-center rounded-r-md hover:bg-sand"
              onClick={() => updateProduct(p.id, { stock: p.stock + 1 })}
              aria-label={`Sumar stock de ${p.name}`}
            >
              <IconPlus size={16} />
            </button>
          </div>
        </div>
      </div>
      <button onClick={() => setMore(!more)} aria-expanded={more} className="mt-3 text-sm font-medium text-olive">
        {more ? "Menos opciones" : "Más opciones"}
      </button>
      {more && (
        <div className="mt-3 space-y-3 border-t border-line pt-3">
          <NumberField
            label="Precio anterior"
            prefix="$"
            thousands
            emptyIsZero
            placeholder="Sin descuento"
            value={p.compareAt ?? 0}
            onCommit={(n) => {
              updateProduct(p.id, { compareAt: n || undefined });
              saved(n ? "Descuento aplicado" : "Descuento quitado");
            }}
          />
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => updateProduct(p.id, { featured: !p.featured })}
              aria-pressed={p.featured}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm ${p.featured ? "bg-olive-soft text-olive-2" : "bg-sand text-ink"}`}
            >
              <IconStar size={17} fill={p.featured ? "currentColor" : "none"} /> {p.featured ? "Destacado" : "Destacar"}
            </button>
            {confirming ? (
              <span className="inline-flex items-center gap-1.5">
                <button
                  onClick={() => {
                    removeProduct(p.id);
                    saved("Producto eliminado");
                  }}
                  className="rounded-md bg-danger px-3 py-2 text-sm font-medium text-paper"
                >
                  Eliminar
                </button>
                <button onClick={onCancelDelete} className="rounded-md px-3 py-2 text-sm hover:bg-sand">
                  No
                </button>
              </span>
            ) : (
              <button onClick={onAskDelete} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-soft">
                <IconTrash size={17} /> Eliminar
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function IconToggle({ on, onClick, label, iconOn, iconOff }: { on: boolean; onClick: () => void; label: string; iconOn: React.ReactNode; iconOff: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={`inline-flex size-9 items-center justify-center rounded-md transition-colors ${on ? "bg-olive-soft text-olive-2" : "text-ink-3 hover:bg-sand"}`}
    >
      {on ? iconOn : iconOff}
    </button>
  );
}

const artFor: Record<CategoryId, ArtKind[]> = { bazar: ["jarra", "cocina", "mate", "vasos"], bolsos: ["bolso", "cartera", "rinonera", "billetera"] };

function NewProduct({ onCancel, onSave }: { onCancel: () => void; onSave: (p: Omit<Product, "id">) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId>("bazar");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [art, setArt] = useState<ArtKind>("jarra");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const pr = Number(price.replace(/\./g, ""));
    const st = Number(stock);
    if (name.trim().length < 3) return setErr("Poné un nombre de al menos 3 letras.");
    if (!pr || pr <= 0) return setErr("El precio tiene que ser un número mayor a 0.");
    if (Number.isNaN(st) || st < 0) return setErr("El stock no puede ser negativo.");
    onSave({
      name: name.trim(),
      category,
      price: pr,
      stock: st,
      visible: true,
      featured: false,
      art,
      image,
      description: description.trim() || "Producto nuevo de Puerto Chill.",
      illustrativePrice: false,
    });
  };

  const input = "w-full rounded-md border border-line bg-paper-2 px-3.5 py-2.5 focus:border-olive focus:outline-none";

  return (
    <form onSubmit={submit} className="mb-8 animate-rise rounded-md border border-olive/40 bg-paper-2 p-5">
      <h2 className="text-[1.05rem] font-semibold">Nuevo producto</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Nombre</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Ej. Tabla de picada" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Categoría</span>
          <select
            value={category}
            onChange={(e) => {
              const c = e.target.value as CategoryId;
              setCategory(c);
              setArt(artFor[c][0]);
            }}
            className={input}
          >
            <option value="bazar">Bazar</option>
            <option value="bolsos">Bolsos y carteras</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Precio</span>
          <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={`${input} tnum`} placeholder="15000" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Stock</span>
          <input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} className={`${input} tnum`} />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium">Descripción corta</span>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className={input} placeholder="Una línea que cuente qué es y para qué sirve." />
      </label>
      <fieldset className="mt-4">
        <legend className="mb-1.5 text-sm font-medium">Foto</legend>
        <div className="flex flex-wrap items-center gap-2">
          <PhotoInput
            label={image ? "Cambiar la foto" : "Subir una foto"}
            onUploaded={(url) => {
              setImage(url);
              setErr(null);
            }}
            onError={setErr}
            className={`size-16 overflow-hidden rounded-sm ring-2 ring-offset-2 ring-offset-paper-2 ${image ? "ring-olive" : "border border-dashed border-line ring-transparent hover:ring-line"}`}
          >
            {image ? (
              <ProductVisual product={{ image, name } as Product} sizes="64px" />
            ) : (
              <span className="flex size-full items-center justify-center text-ink-3"><IconPlus size={20} /></span>
            )}
          </PhotoInput>
          {artFor[category].map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => {
                setArt(a);
                setImage(undefined);
              }}
              aria-pressed={!image && art === a}
              className={`relative size-16 overflow-hidden rounded-sm ring-2 ring-offset-2 ring-offset-paper-2 ${!image && art === a ? "ring-olive" : "ring-transparent hover:ring-line"}`}
            >
              <ProductVisual product={{ art: a, name: a } as Product} sizes="64px" />
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-sm text-ink-3">Subí una foto (JPG, PNG o WebP) o elegí una ilustración provisoria.</p>
      </fieldset>
      {err && <p className="mt-4 text-sm text-danger" role="alert">{err}</p>}
      <div className="mt-5 flex gap-2">
        <button type="submit" className="rounded-md bg-olive px-4 py-2.5 font-medium text-paper hover:bg-olive-2">Crear producto</button>
        <button type="button" onClick={onCancel} className="rounded-md px-4 py-2.5 hover:bg-sand">Cancelar</button>
      </div>
    </form>
  );
}

/* ---------------- Pedidos ---------------- */

const statusTone: Record<OrderStatus, string> = {
  pendiente: "bg-kraft/60 text-ink",
  preparando: "bg-sand text-ink",
  listo: "bg-olive-soft text-olive-2",
  enviado: "bg-forest-ink/70 text-forest-2",
  entregado: "bg-olive text-paper",
  cancelado: "bg-danger-soft text-danger",
};

function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-[0.75rem] font-semibold whitespace-nowrap ${statusTone[status]}`}>{statusLabel[status]}</span>;
}

function Orders({ saved }: { saved: (t?: string) => void }) {
  const { orders } = useStore();
  const [filter, setFilter] = useState<"todos" | OrderStatus>("todos");
  const [open, setOpen] = useState<number | null>(null);
  const list = orders.filter((o) => filter === "todos" || o.status === filter);

  return (
    <>
      <PageHead title="Pedidos" text="Los pedidos hechos en la tienda. Cambiá el estado a medida que los preparás." />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["todos", "pendiente", "preparando", "listo", "enviado", "entregado", "cancelado"] as const).map((s) => {
          const n = s === "todos" ? orders.length : orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`tnum rounded-md px-3.5 py-2 text-sm transition-colors ${filter === s ? "bg-olive text-paper" : "bg-sand text-ink hover:bg-sand-2"}`}
            >
              {s === "todos" ? "Todos" : statusLabel[s]} <span className="opacity-60">{n}</span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-paper-2 p-10">
          <p className="font-serif text-2xl">{orders.length === 0 ? "Todavía no entró ningún pedido." : "No hay pedidos con este estado."}</p>
          <p className="mt-2 max-w-md text-ink-2">
            {orders.length === 0
              ? "Cuando alguien confirme un pedido en la tienda aparece acá, y el stock se descuenta solo."
              : "Probá con otro filtro."}
          </p>
          {orders.length === 0 && (
            <Link href="/tienda" className="mt-5 inline-flex items-center gap-2 rounded-md bg-olive px-4 py-2.5 font-medium text-paper hover:bg-olive-2">
              Ver la tienda <IconExternal size={15} />
            </Link>
          )}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-md border border-line bg-paper-2">
          {list.map((o) => (
            <OrderRow key={o.id} order={o} open={open === o.id} onToggle={() => setOpen(open === o.id ? null : o.id)} saved={saved} />
          ))}
        </ul>
      )}
    </>
  );
}

function OrderRow({ order: o, open, onToggle, saved }: { order: Order; open: boolean; onToggle: () => void; saved: (t?: string) => void }) {
  return (
    <li className="border-b border-line last:border-0">
      <div className="tnum flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <button onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-4 text-left">
          <span className="font-serif text-xl">#{String(o.id).padStart(4, "0")}</span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{o.customer.name}</span>
            <span className="block text-sm text-ink-3">
              {dateTime(o.createdAt)} · {o.lines.reduce((a, l) => a + l.qty, 0)} u. · {o.delivery === "retiro" ? "Retiro en local" : "Envío"}
            </span>
          </span>
        </button>
        <span className="font-semibold">{money(o.total)}</span>
        <label className="flex items-center gap-2">
          <span className="sr-only">Estado del pedido {o.id}</span>
          <StatusPill status={o.status} />
          <select
            value={o.status}
            onChange={(e) => {
              updateOrderStatus(o.id, e.target.value as OrderStatus);
              saved(`Pedido #${String(o.id).padStart(4, "0")}: ${statusLabel[e.target.value as OrderStatus]}`);
            }}
            className="rounded-md border border-line bg-paper-2 px-2.5 py-2 text-sm focus:border-olive focus:outline-none"
          >
            {(Object.keys(statusLabel) as OrderStatus[])
              .filter((s) => !(o.delivery === "retiro" && s === "enviado") && !(o.delivery === "envio" && s === "listo"))
              .map((s) => (
                <option key={s} value={s}>{statusLabel[s]}</option>
              ))}
          </select>
        </label>
      </div>
      {open && (
        <div className="grid animate-rise gap-6 border-t border-line bg-paper px-5 py-5 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-ink-2">Cliente</p>
            <p className="mt-1">{o.customer.name}</p>
            <p className="text-sm text-ink-2">{o.customer.email}</p>
            {o.customer.phone && <p className="text-sm text-ink-2">{o.customer.phone}</p>}
            {o.customer.phone && (
              <a
                href={whatsappTo(o.customer.phone, `Hola ${o.customer.name.split(" ")[0]}! Te escribimos de Puerto Chill por tu pedido #${String(o.id).padStart(4, "0")}.`)}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-olive px-3.5 py-2 text-sm font-medium text-paper hover:bg-olive-2"
              >
                Escribir por WhatsApp <IconExternal size={14} />
              </a>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-ink-2">Entrega y pago</p>
            <p className="mt-1 flex items-center gap-2">
              {o.delivery === "retiro" ? <IconStore size={17} /> : <IconTruck size={17} />}
              {o.delivery === "retiro" ? "Retiro en el local" : `${o.customer.address}, ${o.customer.city}`}
            </p>
            <p className="text-sm text-ink-2">
              {paymentLabel[o.payment]}
              {o.installments > 1 && ` · ${o.installments} cuotas`}
            </p>
          </div>
          <div className="tnum">
            <p className="text-sm font-medium text-ink-2">Detalle</p>
            <ul className="mt-1 space-y-1 text-sm">
              {o.lines.map((l) => (
                <li key={l.productId} className="flex justify-between gap-3"><span>{l.qty} × {l.name}</span><span>{money(l.qty * l.price)}</span></li>
              ))}
              {o.shipping > 0 && <li className="flex justify-between text-ink-2"><span>Envío</span><span>{money(o.shipping)}</span></li>}
              {o.discount > 0 && <li className="flex justify-between text-ink-2"><span>Descuento</span><span>−{money(o.discount)}</span></li>}
              <li className="flex justify-between border-t border-line pt-1.5 font-semibold"><span>Total</span><span>{money(o.total)}</span></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <TextField
              label="Nota interna"
              multiline
              value={o.note ?? ""}
              hint="Solo la ves vos: pago recibido, día de retiro, lo que necesites recordar."
              onCommit={(v) => {
                updateOrderNote(o.id, v);
                saved("Nota guardada");
              }}
            />
          </div>
        </div>
      )}
    </li>
  );
}

/* ---------------- Envíos y pagos ---------------- */

function SalesSettings({ saved }: { saved: (t?: string) => void }) {
  const { settings: s, products } = useStore();
  const set = (patch: Partial<typeof s>, msg?: string) => {
    updateSettings(patch);
    saved(msg);
  };
  const sample = products.find((p) => p.visible) ?? products[0];
  const payNames: PaymentMethod[] = ["mercadopago", "transferencia", "efectivo"];
  const activePays = payNames.filter((m) => s.payments[m]).length;

  return (
    <>
      <PageHead title="Envíos y pagos" text="Lo que definas acá cambia al instante los textos, el carrito y el checkout de la tienda." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Entrega" description="Cómo le llega el pedido a quien compra.">
          <Switch label="Retiro en el local" description="Sin cargo, en Washington 5502." checked={s.pickupEnabled} onChange={(v) => (v || s.shippingEnabled) && set({ pickupEnabled: v })} />
          <div className="border-t border-line" />
          <Switch label="Envío a domicilio" description="A todo el país." checked={s.shippingEnabled} onChange={(v) => (v || s.pickupEnabled) && set({ shippingEnabled: v })} />
          {s.shippingEnabled && (
            <div className="border-t border-line py-4">
              <NumberField label="Costo de envío" prefix="$" thousands value={s.shippingCost} onCommit={(n) => set({ shippingCost: n }, "Costo de envío actualizado")} className="max-w-xs" />
            </div>
          )}
          <div className="border-t border-line" />
          <Switch
            label="Envío gratis"
            description="Para compras que superen un monto."
            checked={s.freeShippingEnabled}
            onChange={(v) => set({ freeShippingEnabled: v }, v ? "Envío gratis activado" : "Envío gratis desactivado")}
          />
          {s.freeShippingEnabled && (
            <div className="border-t border-line py-4">
              <NumberField label="Envío gratis desde" prefix="$" thousands value={s.freeShippingThreshold} min={1} onCommit={(n) => set({ freeShippingThreshold: n })} className="max-w-xs" />
            </div>
          )}
          <p className="border-t border-line py-3 text-sm text-ink-3">Tiene que quedar al menos una forma de entrega activa.</p>
        </Panel>

        <Panel title="Pago y financiación" description="Medios disponibles en el checkout.">
          {payNames.map((m) => (
            <div key={m} className="border-b border-line">
              <Switch
                label={paymentLabel[m]}
                checked={s.payments[m]}
                onChange={(v) => (v || activePays > 1) && set({ payments: { ...s.payments, [m]: v } })}
                description={m === "transferencia" ? `${s.transferDiscount}% de descuento` : m === "efectivo" ? "Solo con retiro en el local" : "Integración real pendiente"}
              />
            </div>
          ))}
          {s.payments.transferencia && (
            <div className="border-b border-line py-4">
              <NumberField label="Descuento por transferencia" suffix="%" max={50} value={s.transferDiscount} onCommit={(n) => set({ transferDiscount: n })} className="max-w-[10rem]" />
            </div>
          )}
          <Switch
            label="Cuotas sin interés"
            description="Se muestran en cada producto y en el carrito."
            checked={s.financingEnabled}
            onChange={(v) => set({ financingEnabled: v }, v ? "Cuotas activadas" : "Cuotas desactivadas")}
          />
          {s.financingEnabled && (
            <div className="border-t border-line py-4">
              <span className="mb-1.5 block text-sm font-medium">Cantidad de cuotas</span>
              <div className="flex flex-wrap gap-2">
                {[3, 6, 12].map((n) => (
                  <button
                    key={n}
                    onClick={() => set({ installments: n })}
                    aria-pressed={s.installments === n}
                    className={`tnum rounded-md px-4 py-2 text-sm font-medium ${s.installments === n ? "bg-olive text-paper" : "bg-sand text-ink hover:bg-sand-2"}`}
                  >
                    {n} cuotas
                  </button>
                ))}
              </div>
              {sample && (
                <p className="mt-3 text-sm text-ink-2">
                  Así se ve: <span className="text-olive">{installmentLine(sample.price, s)}</span> en “{sample.name}”.
                </p>
              )}
            </div>
          )}
        </Panel>

        <div className="lg:col-span-2"><Panel title="Stock" description="Cuándo avisar que quedan pocas unidades.">
          <div className="py-4">
            <NumberField
              label="Avisar “Últimas unidades” desde"
              suffix="u."
              value={s.lowStockThreshold}
              max={99}
              onCommit={(n) => set({ lowStockThreshold: n })}
              className="max-w-xs"
            />
          </div>
        </Panel></div>
      </div>
    </>
  );
}

/* ---------------- Contenido ---------------- */

function ContentEditor({ saved }: { saved: (t?: string) => void }) {
  const { content: c } = useStore();
  const set = (patch: Partial<typeof c>) => {
    updateContent(patch);
    saved();
  };
  return (
    <>
      <PageHead
        title="Textos del sitio"
        text="Lo que se lee en la tienda. Se guarda al salir de cada campo."
        actions={
          <Link href="/tienda" className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 hover:bg-sand">
            Ver cambios en la tienda <IconExternal size={15} />
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Barra de anuncio" description="La franja azul arriba de todo.">
          <div className="space-y-4 py-5">
            <TextField label="Texto" value={c.announcement} onCommit={(v) => set({ announcement: v })} />
            <div className="on-dark rounded-sm bg-forest px-3 py-2 text-center text-[0.8rem] tracking-[0.06em] text-paper">{c.announcement}</div>
          </div>
        </Panel>
        <Panel title="Vidriera" description="El primer bloque de la tienda.">
          <div className="space-y-4 py-5">
            <TextField label="Título" value={c.heroTitle} onCommit={(v) => set({ heroTitle: v })} />
            <TextField label="Texto" multiline value={c.heroText} onCommit={(v) => set({ heroText: v })} />
            <TextField label="Botón" value={c.heroCta} onCommit={(v) => set({ heroCta: v })} />
          </div>
        </Panel>
        <Panel title="Local" description="Dirección y horarios del cierre de la página.">
          <div className="space-y-4 py-5">
            <TextField label="Frase de cierre" value={c.bandTitle} onCommit={(v) => set({ bandTitle: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Dirección" value={c.address} onCommit={(v) => set({ address: v })} />
              <TextField label="Localidad" value={c.city} onCommit={(v) => set({ city: v })} />
            </div>
            <TextField label="Horarios" value={c.hours} onCommit={(v) => set({ hours: v })} hint="Ej. Lunes a sábado de 9 a 19. Vacío = no se muestra." />
          </div>
        </Panel>
        <Panel title="Redes y contacto">
          <div className="space-y-4 py-5">
            <TextField label="Instagram" value={c.instagram} onCommit={(v) => set({ instagram: v })} hint="Ej. @puertochill. Vacío = no se muestra el enlace." />
            <TextField label="WhatsApp" value={c.whatsapp} onCommit={(v) => set({ whatsapp: v })} hint="Con código de país, ej. 54 9 11 1234-5678." />
          </div>
        </Panel>
      </div>
    </>
  );
}
