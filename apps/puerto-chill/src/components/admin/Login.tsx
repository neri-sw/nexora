"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand";
import { IconLock } from "@/components/icons";
import { login } from "@/lib/admin-client";

/** Pantalla de ingreso al panel. Se muestra desde el servidor cuando no hay sesión. */
export function Login() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return setErr("Escribí la contraseña.");
    setBusy(true);
    setErr(null);
    try {
      await login(password);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="on-dark grid min-h-dvh place-items-center bg-forest px-5 py-10 text-paper">
      <form onSubmit={submit} className="w-full max-w-sm animate-rise rounded-md bg-paper-2 p-6 text-ink shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3">
          <Logo className="size-14" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[1.3rem] tracking-[-0.01em]">Panel</span>
            <span className="mt-1 text-[0.78rem] text-ink-3">Puerto Chill</span>
          </span>
        </div>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-medium">Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3.5 py-2.5 focus:border-olive focus:outline-none"
          />
        </label>
        {err && <p className="mt-3 text-sm text-danger" role="alert">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-olive px-4 py-2.5 font-medium text-paper hover:bg-olive-2 disabled:opacity-60"
        >
          <IconLock size={17} /> {busy ? "Entrando…" : "Entrar"}
        </button>
        <Link href="/tienda" className="mt-4 block text-center text-sm text-ink-3 hover:text-ink">
          Volver a la tienda
        </Link>
      </form>
    </div>
  );
}

/** Renueva la cookie de sesión (1 año) cada vez que se abre el panel. */
export function KeepSession() {
  useEffect(() => {
    fetch("/api/session", { credentials: "same-origin", cache: "no-store" }).catch(() => {});
  }, []);
  return null;
}
