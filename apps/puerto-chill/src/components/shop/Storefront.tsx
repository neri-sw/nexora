"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addToCart, useCart, useStore } from "@/lib/store";
import { categoryLabel, installmentLine, mapsUrl, money } from "@/lib/format";
import type { CategoryId, Product } from "@/lib/types";
import { Logo, ProductVisual, ScriptAccent, Tag } from "@/components/brand";
import {
  IconArrow,
  IconBag,
  IconCard,
  IconChat,
  IconCheck,
  IconClock,
  IconClose,
  IconCursor,
  IconInstagram,
  IconMenu,
  IconPin,
  IconSearch,
  IconStore,
  IconTruck,
} from "@/components/icons";
import { CartDrawer } from "./CartDrawer";
import { ProductSheet } from "./ProductSheet";

type Filter = "todos" | CategoryId;
type Sort = "destacados" | "menor" | "mayor";

export function Storefront() {
  const { products, settings, content } = useStore();
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("destacados");
  const [bump, setBump] = useState(0);
  const [detail, setDetail] = useState<Product | null>(null);
  const [announce, setAnnounce] = useState("");
  const cartBtn = useRef<HTMLButtonElement>(null);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const visible = products.filter((p) => p.visible);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const out = visible.filter(
      (p) =>
        (filter === "todos" || p.category === filter) &&
        (!q || p.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q)),
    );
    if (sort === "menor") out.sort((a, b) => a.price - b.price);
    else if (sort === "mayor") out.sort((a, b) => b.price - a.price);
    else out.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.stock > 0) - Number(a.stock > 0));
    return out;
  }, [visible, filter, query, sort]);

  /** Gesto de firma: la etiqueta del producto vuela hasta el carrito. */
  const handleAdd = useCallback((p: Product, from: HTMLElement) => {
    addToCart(p.id);
    setBump((b) => b + 1);
    setAnnounce(`Agregaste ${p.name} al carrito.`);
    const to = cartBtn.current;
    if (!to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const dot = document.createElement("span");
    dot.textContent = money(p.price);
    Object.assign(dot.style, {
      position: "fixed",
      left: `${a.left + a.width / 2}px`,
      top: `${a.top + a.height / 2}px`,
      zIndex: "60",
      padding: "4px 10px 4px 14px",
      background: "#c9a77c",
      color: "#2f2924",
      font: "600 12px var(--font-sans)",
      borderRadius: "0 3px 3px 0",
      clipPath: "polygon(8px 0,100% 0,100% 100%,8px 100%,0 50%)",
      pointerEvents: "none",
      translate: "-50% -50%",
    });
    document.body.appendChild(dot);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    dot
      .animate(
        [
          { transform: "translate(0,0) rotate(0) scale(1)", opacity: 1 },
          { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 70}px) rotate(-14deg) scale(1)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${dx}px, ${dy}px) rotate(-24deg) scale(0.35)`, opacity: 0.2 },
        ],
        { duration: 720, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      )
      .finished.finally(() => dot.remove());
  }, []);

  const goCatalog = (f: Filter) => {
    setFilter(f);
    setMenuOpen(false);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    document.body.style.overflow = cartOpen || menuOpen || detail ? "hidden" : "";
  }, [cartOpen, menuOpen, detail]);

  const freeShip = settings.freeShippingEnabled && settings.shippingEnabled;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Barra de anuncio */}
      <div className="on-dark bg-forest px-4 py-2.5 text-center text-[0.85rem] tracking-[0.02em] text-paper">
        {content.announcement}
      </div>

      {/* Encabezado */}
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper-2/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 sm:px-8">
          <Link href="/tienda" aria-label="Puerto Chill, inicio de la tienda" className="rounded-full">
            <Logo eager className="size-14 sm:size-16" />
          </Link>
          <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
            <NavLink onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Inicio</NavLink>
            <NavLink onClick={() => goCatalog("todos")} active={filter === "todos"}>Tienda</NavLink>
            <NavLink onClick={() => goCatalog("bazar")} active={filter === "bazar"}>Bazar</NavLink>
            <NavLink onClick={() => goCatalog("bolsos")} active={filter === "bolsos"}>Bolsos y carteras</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <button
              ref={cartBtn}
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2.5 rounded-md bg-olive px-4 py-2.5 font-medium text-paper transition-colors hover:bg-olive-2 active:translate-y-px"
            >
              <IconBag size={19} />
              <span className="hidden sm:inline">Mi carrito</span>
              <span
                key={bump}
                aria-label={`${count} productos`}
                className="tnum inline-flex min-w-6 animate-bump items-center justify-center rounded-full bg-paper px-1.5 py-0.5 text-[0.75rem] font-semibold text-olive-2"
              >
                {count}
              </span>
            </button>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-md border border-line text-ink md:hidden"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <IconMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button className="absolute inset-0 animate-fade bg-ink/40" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-x-0 top-0 animate-rise rounded-b-lg bg-paper-2 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <Logo className="size-14" />
              <button className="inline-flex size-11 items-center justify-center rounded-md border border-line" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}>
                <IconClose />
              </button>
            </div>
            <nav className="mt-6 flex flex-col font-serif text-2xl" aria-label="Principal">
              {([
                ["Inicio", () => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }],
                ["Tienda", () => goCatalog("todos")],
                ["Bazar", () => goCatalog("bazar")],
                ["Bolsos y carteras", () => goCatalog("bolsos")],
              ] as const).map(([label, fn]) => (
                <button key={label} onClick={fn} className="border-b border-line py-3.5 text-left">
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main id="inicio" className="flex-1">
        {/* Vidriera */}
        <section className="bg-sand">
          <div className="mx-auto max-w-7xl px-5 pt-12 pb-14 sm:px-8 lg:pt-20 lg:pb-24">
            <div className="max-w-3xl">
              <h1 className="animate-rise font-serif text-[clamp(2.9rem,7vw,5.75rem)] leading-[0.98] tracking-[-0.025em] text-ink">
                <ScriptAccent text={content.heroTitle} />
              </h1>
              <p className="mt-7 max-w-[34rem] animate-rise text-lg leading-relaxed text-ink-2 [animation-delay:90ms]">
                {content.heroText}
              </p>
              <div className="mt-9 flex animate-rise flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:160ms]">
                <button
                  onClick={() => goCatalog("todos")}
                  className="group inline-flex items-center gap-3 rounded-md bg-olive px-6 py-4 font-medium text-paper transition-colors hover:bg-olive-2"
                >
                  {content.heroCta}
                  <IconArrow size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <a href={mapsUrl(content)} target="_blank" rel="noreferrer" className="text-[0.95rem] font-medium text-ink underline decoration-ink/30 hover:decoration-ink">
                  Cómo llegar al local
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section aria-label="Formas de compra" className="border-y border-line bg-linen">
          <ul className="mx-auto grid max-w-7xl grid-cols-1 divide-line px-5 sm:grid-cols-3 sm:divide-x sm:px-8">
            <Benefit icon={<IconCursor />} title="Compra online" text="Elegí, pagá y listo. Te avisamos cuando está." />
            <Benefit
              icon={<IconStore />}
              title={settings.pickupEnabled ? "Retiro en el local" : "Atención en el local"}
              text={`${content.address}, ${content.city.split(",")[0]}`}
            />
            <Benefit
              icon={settings.financingEnabled ? <IconCard /> : <IconTruck />}
              title={
                freeShip
                  ? `Envío gratis desde ${money(settings.freeShippingThreshold)}`
                  : settings.shippingEnabled
                    ? "Envíos a todo el país"
                    : "Retiro sin cargo"
              }
              text={
                settings.financingEnabled
                  ? `Y hasta ${settings.installments} cuotas sin interés.`
                  : "Despachamos a todo el país."
              }
            />
          </ul>
        </section>

        {/* Catálogo */}
        <section id="catalogo" className="scroll-mt-20 bg-paper">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-serif text-[clamp(2.1rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.02em]">
                  Elegidos para vos
                </h2>
                <p className="mt-3 max-w-lg text-ink-2">
                  Bazar para la mesa de todos los días y bolsos para salir. Todo lo que ves está en el local.
                </p>
              </div>
              <label className="relative block w-full lg:w-80">
                <span className="sr-only">Buscar un producto</span>
                <IconSearch size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar un producto…"
                  className="w-full rounded-md border border-line bg-paper-2 py-3 pr-4 pl-10 text-ink placeholder:text-ink-3 focus:border-olive focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-8 flex items-center justify-between gap-3 border-b border-line pb-5">
              <div role="tablist" aria-label="Categorías" className="-mx-5 flex min-w-0 gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
                {(["todos", "bazar", "bolsos"] as Filter[]).map((f) => {
                  const n = f === "todos" ? visible.length : visible.filter((p) => p.category === f).length;
                  const on = filter === f;
                  return (
                    <button
                      key={f}
                      role="tab"
                      aria-selected={on}
                      onClick={() => setFilter(f)}
                      className={`tnum inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-[0.95rem] whitespace-nowrap transition-colors ${
                        on ? "bg-olive text-paper" : "bg-sand text-ink hover:bg-sand-2"
                      }`}
                    >
                      {f === "todos" ? "Todos" : categoryLabel[f]}
                      <span className={`text-[0.75rem] ${on ? "text-paper/90" : "text-ink-3"}`}>{n}</span>
                    </button>
                  );
                })}
              </div>
              <label className="flex shrink-0 items-center gap-2 text-sm text-ink-2">
                <span className="hidden sm:inline">Ordenar</span>
                <span className="sr-only sm:hidden">Ordenar</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="rounded-md border border-line bg-paper-2 px-3 py-2 text-ink focus:border-olive focus:outline-none"
                >
                  <option value="destacados">Destacados</option>
                  <option value="menor">Menor precio</option>
                  <option value="mayor">Mayor precio</option>
                </select>
              </label>
            </div>

            {list.length === 0 ? (
              <div className="mt-12 flex flex-col items-start gap-4 rounded-md border border-dashed border-line bg-paper-2 p-10">
                <p className="font-serif text-2xl">No encontramos “{query}”.</p>
                <p className="text-ink-2">Probá con otra palabra o mirá todo el catálogo.</p>
                <button
                  onClick={() => { setQuery(""); setFilter("todos"); }}
                  className="rounded-md bg-sand px-4 py-2.5 text-ink hover:bg-sand-2"
                >
                  Ver todo
                </button>
              </div>
            ) : (
              <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
                {list.map((p) => (
                  <ProductCard key={p.id} product={p} inCart={cart[p.id] ?? 0} onAdd={handleAdd} onOpen={() => setDetail(p)} />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Cierre */}
        <section className="on-dark bg-forest text-paper">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:py-28">
            <h2 className="font-serif text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[1.02] tracking-[-0.02em]">
              <ScriptAccent text={content.bandTitle} tone="light" />
            </h2>
            <div className="space-y-4 text-forest-ink">
              <p className="flex items-start gap-3 text-lg">
                <IconPin className="mt-1 shrink-0 text-sand" />
                <span>
                  Visitá nuestro local en {content.address}, {content.city}.
                </span>
              </p>
              {content.hours && (
                <p className="flex items-start gap-3">
                  <IconClock className="mt-0.5 shrink-0 text-sand" />
                  {content.hours}
                </p>
              )}
              <a
                href={mapsUrl(content)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-md border border-paper/30 px-4 py-2.5 text-paper transition-colors hover:bg-paper hover:text-forest"
              >
                Ver en el mapa <IconArrow size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-sand">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <Logo className="size-24" />
            <p className="text-sm text-ink-2">Puerto Chill · Bolsos, bazar y home deco</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.95rem]">
            {content.instagram && (
              <a className="inline-flex items-center gap-2 hover:underline" href={`https://instagram.com/${content.instagram.replace("@", "")}`} target="_blank" rel="noreferrer">
                <IconInstagram size={18} /> {content.instagram}
              </a>
            )}
            {content.whatsapp && (
              <a className="inline-flex items-center gap-2 hover:underline" href={`https://wa.me/${content.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <IconChat size={18} /> WhatsApp
              </a>
            )}
            <Link href="/terminos" className="underline decoration-ink/30 hover:decoration-ink">Términos y condiciones</Link>
            <Link href="/arrepentimiento" className="underline decoration-ink/30 hover:decoration-ink">Botón de arrepentimiento</Link>
          </div>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ProductSheet
        product={detail ? (products.find((x) => x.id === detail.id) ?? detail) : null}
        inCart={detail ? (cart[detail.id] ?? 0) : 0}
        onClose={() => setDetail(null)}
        onAdd={handleAdd}
        onOpenCart={() => {
          setDetail(null);
          setCartOpen(true);
        }}
      />
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}

function NavLink({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-[0.95rem] transition-colors hover:bg-sand ${active ? "text-ink" : "text-ink-2"}`}
    >
      {children}
    </button>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="flex items-center gap-4 border-b border-line py-5 last:border-0 sm:border-0 sm:px-6 sm:first:pl-0">
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-paper-2 text-olive ring-1 ring-line">
        {icon}
      </span>
      <span>
        <span className="block font-medium text-ink">{title}</span>
        <span className="block text-sm text-ink-2">{text}</span>
      </span>
    </li>
  );
}

function ProductCard({
  product: p,
  inCart,
  onAdd,
  onOpen,
}: {
  product: Product;
  inCart: number;
  onAdd: (p: Product, from: HTMLElement) => void;
  onOpen: () => void;
}) {
  const { settings } = useStore();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const soldOut = p.stock <= 0;
  const maxed = !soldOut && inCart >= p.stock;
  const low = !soldOut && p.stock <= settings.lowStockThreshold;
  const off = p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
  const cuotas = installmentLine(p.price, settings);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <li className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-sand">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Ver ${p.name}`}
          className={`absolute inset-0 cursor-zoom-in transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.035] ${soldOut ? "grayscale-[0.7] opacity-70" : ""}`}
        >
          <ProductVisual product={p} framed />
        </button>
        <div className="pointer-events-none absolute top-3 left-5 flex flex-col items-start gap-2">
          {soldOut && <Tag>Sin stock</Tag>}
          {low && <Tag tone="danger">Últimas {p.stock}</Tag>}
          {off > 0 && <Tag tone="terra">−{off}% off</Tag>}
        </div>
        {inCart > 0 && (
          <span className="tnum absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-paper-2/95 px-2.5 py-1 text-[0.72rem] font-semibold text-olive-2 shadow-sm">
            <IconCheck size={13} /> {inCart} en el carrito
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <h3 className="font-serif text-[1.2rem] leading-snug text-ink sm:text-[1.35rem]">
          <button type="button" onClick={onOpen} className="text-left decoration-ink/30 underline-offset-4 hover:underline">
            {p.name}
          </button>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-2">{p.description}</p>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
          <span className="tnum font-serif text-[1.3rem] text-ink">{money(p.price)}</span>
          {off > 0 && <span className="tnum text-sm text-ink-3 line-through">{money(p.compareAt!)}</span>}
        </div>
        {cuotas && <p className="tnum mt-0.5 text-[0.8rem] text-olive">{cuotas}</p>}
        <div className="mt-auto pt-4">
          <button
            type="button"
            disabled={soldOut || maxed}
            onClick={(e) => {
              onAdd(p, e.currentTarget);
              setJustAdded(true);
              window.clearTimeout(timer.current);
              timer.current = window.setTimeout(() => setJustAdded(false), 1500);
            }}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[0.95rem] font-medium transition-[background-color,color] duration-200 disabled:cursor-not-allowed ${
              justAdded
                ? "bg-olive-soft text-olive-2"
                : "bg-olive text-paper hover:bg-olive-2 active:translate-y-px disabled:bg-sand disabled:text-ink-3"
            }`}
          >
            {soldOut ? (
              "Sin stock"
            ) : justAdded ? (
              <>
                <IconCheck size={18} /> Agregado
              </>
            ) : maxed ? (
              "No hay más stock"
            ) : (
              "Agregar al carrito"
            )}
          </button>
        </div>
      </div>
    </li>
  );
}
