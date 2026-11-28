import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { LegalPage, shopContent } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default async function TerminosPage() {
  await connection();
  const c = await shopContent();
  return (
    <LegalPage title="Términos y condiciones">
      <p>
        Estas condiciones rigen las compras hechas en la tienda online de Puerto Chill, {c.address}, {c.city}. Al confirmar un
        pedido aceptás estas condiciones.
      </p>
      <h2>Cómo funciona una compra</h2>
      <ul>
        <li>Al confirmar el pedido en la tienda queda registrado con un número. <strong>No se cobra nada en ese momento.</strong></li>
        <li>Te contactamos por WhatsApp o teléfono para confirmar stock, coordinar el pago (transferencia, efectivo al retirar o link de Mercado Pago) y la entrega.</li>
        <li>El pedido se prepara una vez acreditado el pago, salvo pago en efectivo al retirar.</li>
      </ul>
      <h2>Precios y stock</h2>
      <ul>
        <li>Los precios están en pesos argentinos e incluyen IVA. El descuento por transferencia y las cuotas son los que figuran en la tienda al confirmar.</li>
        <li>Si un producto se queda sin stock antes de confirmar el pago, te avisamos y no se cobra.</li>
      </ul>
      <h2>Retiro y envíos</h2>
      <ul>
        <li>Retiro en el local: {c.address}, {c.city}{c.hours ? `, ${c.hours}` : ""}.</li>
        <li>Envíos: el costo y el plazo se informan en el checkout y se confirman al coordinar la entrega.</li>
      </ul>
      <h2>Cambios, devoluciones y arrepentimiento</h2>
      <p>
        Tenés 10 días corridos desde que recibís el producto para arrepentirte de la compra, sin costo ni explicación (Ley 24.240,
        art. 34). Podés pedirlo desde el <Link href="/arrepentimiento">Botón de arrepentimiento</Link>. El producto tiene que
        estar sin uso y con su embalaje.
      </p>
      <h2>Datos personales</h2>
      <p>
        Usamos tu nombre, teléfono, correo y dirección solo para gestionar tu pedido. No los compartimos con terceros salvo lo
        necesario para el envío. Podés pedir que los borremos escribiéndonos.
      </p>
      <h2>Contacto</h2>
      <p>
        {c.whatsapp ? <>WhatsApp: <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}>{c.whatsapp}</a>. </> : null}
        {c.instagram ? <>Instagram: {c.instagram}. </> : null}
        Local: {c.address}, {c.city}.
      </p>
    </LegalPage>
  );
}
