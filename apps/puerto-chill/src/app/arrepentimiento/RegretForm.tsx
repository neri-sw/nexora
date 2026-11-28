"use client";

import { useState } from "react";

export function RegretForm({ whatsapp }: { whatsapp: string }) {
  const [f, setF] = useState({ order: "", name: "", phone: "", reason: "" });
  const [err, setErr] = useState("");
  const digits = whatsapp.replace(/\D/g, "");
  const cls = "w-full rounded-md border border-line bg-paper-2 px-3.5 py-2.5 text-ink focus:border-olive focus:outline-none";
  const field = (k: keyof typeof f, label: string, opts: { type?: string; optional?: boolean } = {}) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}{opts.optional && <span className="font-normal text-ink-3"> (opcional)</span>}</span>
      <input type={opts.type ?? "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={cls} />
    </label>
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.order.trim() || !f.name.trim() || f.phone.replace(/\D/g, "").length < 8) {
      setErr("Completá el número de pedido, tu nombre y un teléfono válido.");
      return;
    }
    setErr("");
    const msg =
      `Hola Puerto Chill. Quiero ejercer el derecho de arrepentimiento por mi compra.\n\n` +
      `Pedido: #${f.order.replace("#", "").trim()}\nNombre: ${f.name.trim()}\nTeléfono: ${f.phone.trim()}` +
      (f.reason.trim() ? `\nComentario: ${f.reason.trim()}` : "");
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  if (!digits) {
    return (
      <p className="rounded-md border border-line bg-paper-2 p-5">
        Escribinos por Instagram o acercate al local con tu número de pedido para pedir el arrepentimiento.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-md border border-line bg-paper-2 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("order", "Número de pedido")}
        {field("name", "Nombre y apellido")}
        {field("phone", "Teléfono / WhatsApp", { type: "tel" })}
        {field("reason", "Comentario", { optional: true })}
      </div>
      {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      <button type="submit" className="rounded-md bg-olive px-4 py-2.5 font-medium text-paper hover:bg-olive-2">
        Enviar solicitud por WhatsApp
      </button>
    </form>
  );
}
