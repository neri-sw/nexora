"use client";

import { useState } from "react";

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 py-4">
      <span>
        <span className="block font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-ink-2">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-sand-2 transition-colors duration-200 peer-checked:bg-olive peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-olive" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-paper-2 shadow-[0_1px_3px_rgba(47,41,36,0.35)] transition-transform duration-200 ease-[var(--ease-out-quint)] peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

/**
 * Campo numérico que confirma al salir o con Enter, para no guardar a cada tecla.
 * Con `thousands` muestra separador de miles mientras no se edita.
 * Con `emptyIsZero` el campo vacío vale 0 y muestra el placeholder.
 */
export function NumberField({
  value,
  onCommit,
  label,
  prefix,
  suffix,
  min = 0,
  max,
  className = "",
  hideLabel,
  thousands,
  emptyIsZero,
  placeholder,
}: {
  value: number;
  onCommit: (n: number) => void;
  label: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  className?: string;
  hideLabel?: boolean;
  thousands?: boolean;
  emptyIsZero?: boolean;
  placeholder?: string;
}) {
  const show = (v: number) => (emptyIsZero && v === 0 ? "" : thousands ? v.toLocaleString("es-AR") : String(v));
  const [draft, setDraft] = useState(show(value));
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setDraft(show(value));
  }
  const empty = draft.trim() === "";
  const n = empty && emptyIsZero ? 0 : Number(draft.replace(/\./g, "").replace(",", "."));
  const invalid = (empty && !emptyIsZero) || Number.isNaN(n) || n < min || (max !== undefined && n > max);

  const commit = () => {
    if (invalid) {
      setDraft(show(value));
      return;
    }
    if (n !== value) onCommit(Math.round(n));
    else setDraft(show(value));
  };

  return (
    <label className={`block ${className}`}>
      <span className={hideLabel ? "sr-only" : "mb-1.5 block text-sm font-medium text-ink"}>{label}</span>
      <span
        className={`tnum flex items-center rounded-md border bg-paper-2 focus-within:border-olive ${invalid ? "border-danger" : "border-line"}`}
      >
        {prefix && <span className="pl-3 text-ink-3">{prefix}</span>}
        <input
          inputMode="numeric"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setDraft(show(value));
          }}
          aria-invalid={invalid}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-ink placeholder:text-ink-3 focus:outline-none"
        />
        {suffix && <span className="shrink-0 pr-3 text-ink-3">{suffix}</span>}
      </span>
    </label>
  );
}

export function TextField({
  value,
  onCommit,
  label,
  multiline,
  hint,
}: {
  value: string;
  onCommit: (v: string) => void;
  label: string;
  multiline?: boolean;
  hint?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setDraft(value);
  }
  const commit = () => draft !== value && onCommit(draft);
  const cls = "w-full rounded-md border border-line bg-paper-2 px-3.5 py-2.5 text-ink focus:border-olive focus:outline-none";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {multiline ? (
        <textarea value={draft} rows={3} onChange={(e) => setDraft(e.target.value)} onBlur={commit} className={`${cls} resize-y`} />
      ) : (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          className={cls}
        />
      )}
      {hint && <span className="mt-1.5 block text-sm text-ink-3">{hint}</span>}
    </label>
  );
}

export function Panel({ title, description, children, actions }: { title: string; description?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-paper-2">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-[1.05rem] font-semibold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="px-5">{children}</div>
    </section>
  );
}
