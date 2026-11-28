"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/admin-client";

/**
 * Envuelve una miniatura (o un botón) y abre el selector de archivos al tocarla.
 * Sube la foto achicada a /api/upload y devuelve la URL con `onUploaded`.
 */
export function PhotoInput({
  children,
  label,
  onUploaded,
  onError,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onUploaded: (url: string) => void;
  onError: (message: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      onUploaded(await uploadImage(file));
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-busy={busy}
      disabled={busy}
      onClick={() => ref.current?.click()}
      className={`relative cursor-pointer ${busy ? "animate-pulse" : ""} ${className}`}
    >
      {children}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
    </button>
  );
}
