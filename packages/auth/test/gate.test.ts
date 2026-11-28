import { describe, expect, it } from "vitest";
import { gate, panelSecret } from "../src/gate";

const S = "panel-k3x9q2m7w1z8";
const g = (p: string, secret: string | null = S) => gate(p, { secret });

describe("gate: panel escondido", () => {
  it("con ruta secreta muestra el panel y su API solo ahí", () => {
    expect(g("/" + S)).toEqual({ action: "rewrite", pathname: "/admin" });
    expect(g(`/${S}/api/admin/state`)).toEqual({ action: "rewrite", pathname: "/api/admin/state" });
    expect(g(`/${S}/api/session`)).toEqual({ action: "rewrite", pathname: "/api/session" });
    expect(g(`/${S}/api/upload`)).toEqual({ action: "rewrite", pathname: "/api/upload" });
  });

  it("con ruta secreta /admin y la API privada directa dan 404", () => {
    for (const p of ["/admin", "/admin/", "/admin/x", "/ADMIN", "/Admin", "/%61dmin", "//admin", "/api/admin/state", "/API/ADMIN/state", "/api/session", "/api/upload", "/api/%61dmin/state", "/admin/api/session", `/${S}/otra`, `/${S}/`])
      expect(g(p), p).toEqual({ action: "notFound" });
  });

  it("lo público sigue igual", () => {
    for (const p of ["/", "/tienda", "/terminos", "/api/state", "/api/orders", "/api/img", "/administracion-de-cookies", "/api/sessions"])
      expect(g(p), p).toEqual({ action: "next" });
  });

  it("una ruta parecida a la secreta no entra", () => {
    expect(g("/" + S.slice(0, -1))).toEqual({ action: "next" });
    expect(g("/" + S + "x")).toEqual({ action: "next" });
  });

  it("URL mal codificada da 404", () => {
    expect(g("/%E0%A4%A")).toEqual({ action: "notFound" });
  });

  it("sin ruta secreta todo queda en /admin (desarrollo y pruebas)", () => {
    expect(g("/admin", null)).toEqual({ action: "next" });
    expect(g("/api/admin/state", null)).toEqual({ action: "next" });
    expect(g("/api/session", null)).toEqual({ action: "next" });
    expect(g("/admin/api/session", null)).toEqual({ action: "rewrite", pathname: "/api/session" });
  });

  it("la ruta secreta tiene que ser larga", () => {
    expect(panelSecret("")).toBeNull();
    expect(panelSecret(undefined)).toBeNull();
    expect(panelSecret("/" + S + "/")).toBe(S);
    expect(() => panelSecret("panel")).toThrow();
    expect(() => panelSecret("panel con espacios largo")).toThrow();
  });
});
