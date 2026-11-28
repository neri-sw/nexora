"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { categoryLabel, installmentLine, money } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductVisual, Tag } from "@/components/brand";
import { IconBag, IconCheck, IconClose, IconStore, IconTruck } from "@/components/icons";

/** Ficha de producto: mismo lenguaje que el carrito (panel lateral en escritorio, hoja completa en móvil). */
export function ProductSheet({
  product: p,
  inCart,
  onClose,
  onAdd,
  onOpenCart,
}: {
  product: Product | null;
  inCart: number;
  onClose: () => void;
  onAdd: (p: Product, from: HTMLElement) => void;
  onOpenCart: () => void;
}) {
  const { settings, content } = useStore();
  const [added, setAdded] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const [prevId, setPrevId] = useState(p?.id);
  if (prevId !== p?.id) {
    setPrevId(p?.id);
    setAdded(false);
  }

  useEffect(() => {
    if (!p) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [p, onClose]);

  if (!p) return null;

  const soldOut = p.stock <= 0;
  const maxed = !soldOut && inCart >= p.stock;
  const low = !soldOut && p.stock <= settings.lowStockThreshold;
  const off = p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
  const cuotas = installmentLine(p.price, settings);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <button aria-label="Cerrar ficha" className="absolute inset-0 animate-fade cursor-default bg-ink/45" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-[34rem] animate-drawer flex-col bg-paper-2 shadow-[-20px_0_50px_-30px_rgba(47,41,36,0.6)] focus:outline-none"
      >
        <div className="flex-1 overflow-y-auto">
          <div className="relative aspect-[5/4] bg-sand">
            <ProductVisual product={p} framed sizes="(min-width: 640px) 34rem, 100vw" />
            <div className="pointer-events-none absolute top-4 left-6 flex flex-col items-start gap-2">
              {soldOut && <Tag>Sin stock</Tag>}
              {low && <Tag tone="danger">Últimas {p.stock}</Tag>}
              {off > 0 && <Tag tone="terra">−{off}% off</Tag>}
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-md bg-paper-2/90 text-ink shadow-sm hover:bg-paper-2"
              aria-label="Cerrar"
            >
              <IconClose size={18} />
            </button>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <p className="text-sm text-ink-3">{categoryLabel[p.category]}</p>
            <h2 id="sheet-title" className="mt-1 font-serif text-[2rem] leading-[1.08] tracking-[-0.015em]">
              {p.name}
            </h2>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="tnum font-serif text-[1.9rem] leading-none">{money(p.price)}</span>
              {off > 0 && <span className="tnum text-ink-3 line-through">{money(p.compareAt!)}</span>}
            </div>
            {cuotas && <p className="tnum mt-1.5 text-olive">{cuotas}</p>}
            {settings.payments.transferencia && settings.transferDiscount > 0 && (
              <p className="tnum mt-0.5 text-sm text-ink-2">
                {money(p.price * (1 - settings.transferDiscount / 100))} pagando por transferencia
              </p>
            )}

            <p className="mt-6 max-w-[60ch] leading-relaxed text-ink-2">{p.description}</p>

            <ul className="mt-7 divide-y divide-line border-y border-line text-[0.95rem]">
              {settings.pickupEnabled && (
                <li className="flex items-start gap-3 py-3.5">
                  <IconStore size={20} className="mt-0.5 shrink-0 text-olive" />
                  <span>
                    <span className="block font-medium">Retiro sin cargo</span>
                    <span className="block text-sm text-ink-2">En {content.address}, {content.city.split(",")[0]}.</span>
                  </span>
                </li>
              )}
              {settings.shippingEnabled && (
                <li className="flex items-start gap-3 py-3.5">
                  <IconTruck size={20} className="mt-0.5 shrink-0 text-olive" />
                  <span>
                    <span className="block font-medium">Envío a todo el país</span>
                    <span className="tnum block text-sm text-ink-2">
                      {settings.freeShippingEnabled
                        ? `Gratis desde ${money(settings.freeShippingThreshold)}; si no, ${money(settings.shippingCost)}.`
                        : `${money(settings.shippingCost)}.`}
                    </span>
                  </span>
                </li>
              )}
              <li className="flex items-start gap-3 py-3.5">
                <IconBag size={20} className="mt-0.5 shrink-0 text-olive" />
                <span>
                  <span className="block font-medium">
                    {soldOut ? "Sin stock por ahora" : p.stock === 1 ? "Queda 1 unidad" : `${p.stock} unidades disponibles`}
                  </span>
                  <span className="block text-sm text-ink-2">
                    {soldOut ? "Escribinos y te avisamos cuando vuelva." : "Lo reservamos cuando confirmás el pedido."}
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line bg-paper px-6 py-4 sm:px-8">
          {inCart > 0 && (
            <p className="tnum mb-2.5 flex items-center gap-1.5 text-sm text-olive-2">
              <IconCheck size={16} /> {inCart} en tu carrito
            </p>
          )}
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={soldOut || maxed}
              onClick={(e) => {
                onAdd(p, e.currentTarget);
                setAdded(true);
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-olive px-5 py-3.5 font-medium text-paper transition-colors hover:bg-olive-2 disabled:cursor-not-allowed disabled:bg-sand disabled:text-ink-3"
            >
              {soldOut ? "Sin stock" : maxed ? "No hay más stock" : added ? "Agregar otro" : "Agregar al carrito"}
            </button>
            {inCart > 0 && (
              <button
                type="button"
                onClick={onOpenCart}
                className="rounded-md border border-line px-4 py-3.5 font-medium text-ink hover:bg-sand"
              >
                Ver carrito
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
