import Image from "next/image";
import type { Product } from "@/lib/types";
import { ProductArt, ShelfLine } from "./ProductArt";

import logo from "@/assets/logo-puerto-chill.png";

/** Logo circular de la marca (sello crema con ancla, verde oliva y terracota). */
export function Logo({ className = "size-14", eager = false }: { className?: string; eager?: boolean }) {
  return (
    <Image
      src={logo}
      alt="Puerto Chill · Bolsos, bazar y home deco"
      sizes="(min-width: 1024px) 112px, 96px"
      loading={eager ? "eager" : "lazy"}
      className={`shrink-0 select-none ${className}`}
    />
  );
}

/**
 * Pone la última palabra de un titular en la script del logo, en terracota.
 * Funciona con cualquier texto que cargue el panel.
 */
export function ScriptAccent({ text, tone = "terra" }: { text: string; tone?: "terra" | "light" }) {
  const t = text.trim();
  const i = t.lastIndexOf(" ");
  if (i < 0) return <>{t}</>;
  const color = tone === "terra" ? "text-terra" : "text-terra-light";
  return (
    <>
      {t.slice(0, i)}{" "}
      <span className={`inline-block font-script text-[0.86em] font-normal leading-[1.15] tracking-normal ${color}`}>
        {t.slice(i + 1)}
      </span>
    </>
  );
}

/** Etiqueta de papel kraft con ojal e hilo: el gesto de mostrador de la marca. */
export function Tag({
  children,
  className = "",
  tone = "kraft",
  string = true,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "kraft" | "paper" | "olive" | "danger" | "terra";
  string?: boolean;
}) {
  const tones = {
    kraft: "bg-kraft text-ink",
    paper: "bg-paper-2 text-ink border border-line",
    olive: "bg-olive text-paper",
    danger: "bg-danger text-paper",
    terra: "bg-terra text-paper",
  } as const;
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {string && (
        <svg className="absolute -left-5 top-1/2 h-4 w-6 -translate-y-1/2" viewBox="0 0 24 16" aria-hidden="true">
          <path d="M1 3c6 0 9 10 22 5" fill="none" stroke="#2f2924" strokeWidth="1" opacity="0.55" />
        </svg>
      )}
      <span
        className={`tnum inline-flex items-center gap-1.5 py-1 pr-2.5 pl-5 text-[0.72rem] font-semibold tracking-[0.02em] ${tones[tone]}`}
        style={{ clipPath: "polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%)", borderRadius: "0 3px 3px 0" }}
      >
        <span className="absolute left-[9px] top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-paper ring-1 ring-ink/30" />
        {children}
      </span>
    </span>
  );
}

export function ProductVisual({
  product,
  className = "",
  sizes,
  framed = false,
}: {
  product: Product;
  className?: string;
  sizes?: string;
  /** Pone la foto como un objeto enmarcado sobre el mismo estante que las ilustraciones. */
  framed?: boolean;
}) {
  if (product.image && framed) {
    return (
      <div className={`absolute inset-0 bg-[#e5dccd] ${className}`}>
        <ShelfLine className="absolute inset-0 size-full" />
        <div className="absolute inset-x-[16%] top-[13%] bottom-[16%] rounded-[4px] bg-paper-2 p-[5%] shadow-[0_16px_24px_-16px_rgba(47,41,36,0.6)]">
          <div className="relative size-full overflow-hidden rounded-[2px]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              loading="eager"
              sizes={sizes ?? "(min-width: 1024px) 18vw, 40vw"}
              className="object-cover"
              style={{ objectPosition: product.imagePosition ?? "50% 50%" }}
            />
          </div>
        </div>
      </div>
    );
  }
  if (product.image) {
    return (
      <Image
        src={product.image}
        alt={product.name}
        fill
        loading="eager"
        sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
        className={`object-cover ${className}`}
        style={{ objectPosition: product.imagePosition ?? "50% 50%" }}
      />
    );
  }
  return <ProductArt kind={product.art} title={product.name} className={`absolute inset-0 size-full ${className}`} />;
}
