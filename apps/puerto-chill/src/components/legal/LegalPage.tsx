import Link from "next/link";
import { Logo } from "@/components/brand";
import { initialFor } from "@/site/server";
import { seed } from "@/lib/seed";
import type { Content } from "@/lib/types";

/** Datos del comercio para las páginas legales (los que carga el dueño en "Textos del sitio"). */
export async function shopContent(): Promise<Content> {
  const init = await initialFor("public");
  return { ...seed.content, ...(init?.data?.content ?? {}) };
}

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-paper">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link href="/" aria-label="Volver a la tienda"><Logo className="size-16" /></Link>
        <Link href="/" className="text-[0.95rem] underline decoration-ink/30 hover:decoration-ink">Volver a la tienda</Link>
      </header>
      <article className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
        <h1 className="font-serif text-[clamp(2.1rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em]">{title}</h1>
        <div className="mt-8 space-y-5 leading-relaxed text-ink-2 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-[1.35rem] [&_h2]:text-ink [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </main>
  );
}
