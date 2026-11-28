import type { Metadata } from "next";
import { connection } from "next/server";
import { StoreHydrator } from "@/components/StoreHydrator";
import { Storefront } from "@/components/shop/Storefront";
import { initialFor } from "@/site/server";

export const metadata: Metadata = {
  title: "Tienda",
};

export default async function TiendaPage() {
  await connection(); // los datos cambian con cada pedido: se leen en cada visita
  return (
    <StoreHydrator init={await initialFor("public")}>
      <Storefront />
    </StoreHydrator>
  );
}
