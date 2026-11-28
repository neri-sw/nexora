"use client";

import { useEffect } from "react";
import { primeStore, startSync, type Initial } from "@/lib/store";

/**
 * Carga en el store los datos que la página trajo del servidor, antes de que se dibujen
 * sus hijos (así no aparecen los datos de ejemplo ni un salto al cargar), y mantiene el refresco.
 */
export function StoreHydrator({ init, children }: { init: Initial; children: React.ReactNode }) {
  primeStore(init);
  useEffect(() => startSync(), []);
  return children;
}
