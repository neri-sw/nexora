/** GET/PUT /api/admin/state: datos completos, solo con sesión del panel. Ver @nexora/state. */
import { stateHandlers } from "@/site/server";

export const GET = stateHandlers.adminGET;
export const PUT = stateHandlers.adminPUT;
