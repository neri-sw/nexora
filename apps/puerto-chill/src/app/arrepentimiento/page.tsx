import type { Metadata } from "next";
import { connection } from "next/server";
import { LegalPage, shopContent } from "@/components/legal/LegalPage";
import { RegretForm } from "./RegretForm";

export const metadata: Metadata = { title: "Botón de arrepentimiento" };

export default async function ArrepentimientoPage() {
  await connection();
  const c = await shopContent();
  return (
    <LegalPage title="Botón de arrepentimiento">
      <p>
        Si compraste en la tienda online, tenés <strong>10 días corridos</strong> desde que recibiste el producto (o desde la
        compra, lo que pase último) para arrepentirte, sin costo ni explicación (Ley 24.240, art. 34; Res. 424/2020).
      </p>
      <p>
        Completá tus datos y enviá la solicitud. Dentro de las 24 horas te respondemos con un código de identificación de tu
        pedido de arrepentimiento y cómo devolver el producto.
      </p>
      <RegretForm whatsapp={c.whatsapp} />
      <p className="text-sm">
        Si no podés usar WhatsApp, acercate al local ({c.address}, {c.city}) con el número de pedido.
      </p>
    </LegalPage>
  );
}
