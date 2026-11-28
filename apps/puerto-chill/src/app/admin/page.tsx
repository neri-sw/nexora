import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Admin } from "@/components/admin/Admin";
import { KeepSession, Login } from "@/components/admin/Login";
import { StoreHydrator } from "@/components/StoreHydrator";
import { auth, initialFor } from "@/site/server";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false },
};

export default async function AdminPage() {
  const jar = await cookies();
  if (!auth.isAdminToken(jar.get(auth.cookieName)?.value)) return <Login />;

  return (
    <>
      <KeepSession />
      <StoreHydrator init={await initialFor("admin")}>
        <Suspense fallback={<div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[16.5rem_1fr]"><div className="bg-forest" /></div>}>
          <Admin />
        </Suspense>
      </StoreHydrator>
    </>
  );
}
