"use client";
/** @nexora/media/client: achicar y subir fotos desde el panel (solo navegador). */

/** Achica la foto (lado mayor `max` px, JPEG) antes de subirla: las funciones tienen límite de body. */
export async function shrink(file: File, max = 1400, quality = 0.84): Promise<Blob> {
  let src: ImageBitmap | HTMLImageElement;
  try {
    src = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    src = await new Promise<HTMLImageElement>((ok, ko) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => ko(new Error("No se pudo leer la imagen. Probá con JPG o PNG."));
      i.src = URL.createObjectURL(file);
    });
  }
  const k = Math.min(1, max / Math.max(src.width, src.height));
  const c = document.createElement("canvas");
  c.width = Math.round(src.width * k);
  c.height = Math.round(src.height * k);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return new Promise((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error("No se pudo procesar la imagen"))), "image/jpeg", quality));
}

/** Sube una foto y devuelve la URL para guardar en el producto. Si la sesión venció, recarga (aparece el login). */
export async function uploadImage(file: File, endpoint = "/api/upload"): Promise<string> {
  const b = await shrink(file);
  const res = await fetch(endpoint, { method: "POST", credentials: "same-origin", headers: { "content-type": "image/jpeg" }, body: b });
  const out = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (res.status === 401) window.location.reload();
  if (!res.ok || !out.url) throw new Error(out.error || "No se pudo subir la imagen");
  return out.url;
}

