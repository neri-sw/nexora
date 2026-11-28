"use client";
/**
 * @nexora/admin-sync: store del navegador sincronizado con @nexora/state. Contrato en ../README.md.
 *
 * Dos modos:
 * - "remote": los datos viven en Vercel Blob. La página los trae del servidor y llama a `primeStore`.
 *   El sitio público recibe la vista sanitizada y nunca guarda el estado (escribe por sus endpoints).
 *   El panel guarda con PUT /api/admin/state: cada cambio es una función que queda en cola; si otro
 *   guardó antes (409), se traen sus datos y se vuelven a aplicar encima los cambios pendientes.
 * - "local": sin servidor configurado (por ejemplo `next dev` sin Blob). Todo queda en localStorage.
 * El carrito (o cualquier dato "del visitante") siempre es de cada navegador.
 */
import { panelApi } from "@nexora/auth/client";
import { useSyncExternalStore } from "react";

export type Scope = "public" | "admin";
export type Initial<Snap> = { scope: Scope; rev: number; data: Snap | null } | null;

export interface SyncedStoreOptions<S extends { version: number }, Snap, C> {
  /** Datos de ejemplo: modo local y primer guardado del panel cuando todavía no hay nada. */
  seed: S;
  /** Claves de localStorage, propias de cada sitio. */
  storeKey: string;
  localKey: string;
  /** Valor inicial del dato local del visitante (por ejemplo el carrito vacío). */
  emptyLocal: C;
  /** Completa lo que la vista pública no trae (por ejemplo `orders: []`). */
  normalize(d: Snap): S;
  /** Por defecto `/api/state` y la API del panel bajo su ruta (ver `panelApi` de @nexora/auth/client). */
  endpoints?: { publicState?: string; adminState?: string | (() => string) };
  /** Refresco automático (ms). Por defecto panel 45 s, sitio público 30 s. */
  refreshMs?: { admin?: number; public?: number };
}

type Fn<S> = (s: S) => S;

export function createSyncedStore<S extends { version: number }, Snap = S, C = Record<string, number>>(o: SyncedStoreOptions<S, Snap, C>) {
  const urls = { publicState: "/api/state", adminState: (() => panelApi("/api/admin/state")) as string | (() => string), ...o.endpoints };
  const adminUrl = () => (typeof urls.adminState === "function" ? urls.adminState() : urls.adminState);
  const listeners = new Set<() => void>();

  let state: S = o.seed;
  let local: C = o.emptyLocal;
  let loaded = false;
  let mode: "local" | "remote" = "local";
  let scope: Scope = "public";
  let primed = false;
  let server: { rev: number; data: S | null } = { rev: 0, data: null };
  let pending: Fn<S>[] = [];
  let flushing = false;
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let retryMs = 2000;
  let ssrState: S = o.seed;

  /** La llama el hidratador durante el render, antes que los componentes que leen el store. */
  function primeStore(init: Initial<Snap>) {
    if (typeof window === "undefined") {
      ssrState = init?.data ? o.normalize(init.data) : o.seed;
      return;
    }
    if (!init) return; // modo local
    if (primed && init.rev <= server.rev) return;
    primed = true;
    mode = "remote";
    scope = init.scope;
    if (init.data) {
      const data = o.normalize(init.data);
      server = { rev: init.rev, data };
      state = replay(data, pending);
    } else {
      // todavía no hay nada guardado: el panel guarda los datos de ejemplo; el sitio solo los muestra
      server = { rev: init.rev, data: null };
      state = o.seed;
      if (scope === "admin" && !pending.length) {
        pending.push(() => o.seed);
        schedule(0);
      }
    }
    ssrState = state;
  }

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      if (mode === "local") {
        const raw = localStorage.getItem(o.storeKey);
        if (raw) {
          const parsed = JSON.parse(raw) as S;
          if (parsed.version === o.seed.version) state = parsed;
        }
      }
      const rawLocal = localStorage.getItem(o.localKey);
      if (rawLocal) local = JSON.parse(rawLocal) as C;
    } catch {
      if (mode === "local") state = o.seed;
      local = o.emptyLocal;
    }
    window.addEventListener("storage", (e) => {
      if (mode === "local" && e.key === o.storeKey && e.newValue) state = JSON.parse(e.newValue);
      if (e.key === o.localKey) local = e.newValue ? JSON.parse(e.newValue) : o.emptyLocal;
      emit();
    });
  }

  const emit = () => listeners.forEach((l) => l());
  function subscribe(l: () => void) {
    load();
    listeners.add(l);
    return () => listeners.delete(l);
  }

  function persist() {
    try {
      if (mode === "local") localStorage.setItem(o.storeKey, JSON.stringify(state));
      localStorage.setItem(o.localKey, JSON.stringify(local));
    } catch {
      /* modo privado o sin espacio: sigue en memoria */
    }
    emit();
  }

  /** Aplica un cambio. En el panel queda en cola para guardarse; en el sitio público no se guarda. */
  function setState(fn: Fn<S>) {
    load();
    state = fn(state);
    if (mode === "remote") {
      if (scope === "admin") {
        pending.push(fn);
        schedule(600);
      } else {
        console.warn("[store] cambio ignorado en el sitio público");
      }
    }
    persist();
  }

  function setLocal(fn: (c: C) => C) {
    load();
    local = fn(local);
    persist();
  }

  function replay(base: S, fns: Fn<S>[]): S {
    let s = structuredClone(base);
    for (const fn of fns) {
      try {
        s = fn(s);
      } catch (e) {
        console.warn("[store] se descartó un cambio que ya no aplica", e);
      }
    }
    return s;
  }

  async function api(method: string, url: string, body?: unknown) {
    const res = await fetch(url, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, body: data };
  }

  function schedule(ms: number) {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, ms);
  }

  async function flush() {
    if (flushing || !pending.length) return;
    flushing = true;
    try {
      for (let i = 0; i < 6 && pending.length; i++) {
        const batch = pending.slice();
        const next = replay(server.data ?? o.seed, batch);
        const r = await api("PUT", adminUrl(), { baseRev: server.rev, data: next });
        if (r.status === 200) {
          pending = pending.slice(batch.length);
          server = { rev: Number(r.body.rev), data: next };
          continue;
        }
        if (r.status === 409) {
          const rev = Number(r.body.rev);
          // solo es un conflicto real si el servidor tiene una versión más nueva que la conocida
          if (!(rev > server.rev) || !r.body.data) throw new Error("409 sin versión nueva");
          server = { rev, data: o.normalize(r.body.data as Snap) };
          state = replay(server.data!, pending);
          emit();
          continue;
        }
        if (r.status === 401) {
          // la sesión venció: se recarga y aparece el login
          pending = [];
          window.location.reload();
          return;
        }
        throw new Error("HTTP " + r.status);
      }
      retryMs = 2000;
    } catch (e) {
      console.warn("[store] no se pudo guardar, reintento en", retryMs, "ms", e);
      flushing = false;
      schedule(retryMs);
      retryMs = Math.min(retryMs * 2, 30000);
      return;
    }
    flushing = false;
    if (pending.length) schedule(300);
  }

  /** Trae la última versión del servidor si no hay cambios propios sin guardar. */
  async function pull(fresh = false) {
    if (mode !== "remote" || flushing || pending.length) return;
    try {
      const url = scope === "admin" ? adminUrl() : `${urls.publicState}${fresh ? "?fresh=1" : ""}`;
      const r = await api("GET", url);
      const rev = Number(r.body.rev);
      // la caché puede devolver una versión vieja: solo se toma si es más nueva
      if (r.status === 200 && r.body.data && rev > server.rev && !pending.length && !flushing) {
        server = { rev, data: o.normalize(r.body.data as Snap) };
        state = server.data!;
        emit();
      }
    } catch {
      /* sin conexión: se reintenta en el próximo ciclo */
    }
  }

  let syncing = false;
  /** Refresco automático mientras la página está abierta. Devuelve la función que lo apaga. */
  function startSync() {
    if (syncing || mode !== "remote") return () => {};
    syncing = true;
    const every = scope === "admin" ? (o.refreshMs?.admin ?? 45_000) : (o.refreshMs?.public ?? 30_000);
    const t = setInterval(() => {
      if (!document.hidden) pull();
    }, every);
    const onVis = () => {
      if (!document.hidden) pull();
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (pending.length || flushing) e.preventDefault();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      syncing = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("beforeunload", onUnload);
    };
  }

  function useStore(): S {
    return useSyncExternalStore(
      subscribe,
      () => {
        load();
        return state;
      },
      () => (typeof window === "undefined" ? ssrState : state),
    );
  }

  function useLocal(): C {
    return useSyncExternalStore(
      subscribe,
      () => {
        load();
        return local;
      },
      () => o.emptyLocal,
    );
  }

  return {
    primeStore,
    startSync,
    useStore,
    useLocal,
    setState,
    setLocal,
    pull,
    /** Estado actual (fuera de React). */
    getState: () => (load(), state),
    getLocal: () => (load(), local),
    /** "local" = sin servidor: las acciones públicas (pedidos) se resuelven en el navegador. */
    getMode: () => (load(), mode),
    /** Cliente HTTP con la sesión del panel, para endpoints propios. */
    api,
  };
}
