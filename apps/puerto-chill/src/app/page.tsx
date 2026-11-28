import { connection } from "next/server";
import { StoreHydrator } from "@/components/StoreHydrator";
import { Storefront } from "@/components/shop/Storefront";
import { initialFor } from "@/site/server";

/** La home es la tienda. El panel queda en /admin. */
export default async function Home() {
  await connection(); // los datos cambian con cada pedido: se leen en cada visita
  return (
    <StoreHydrator init={await initialFor("public")}>
      <Storefront />
    </StoreHydrator>
  );
}
