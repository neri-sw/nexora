/** GET /api/state → { rev, data } público y sanitizado. Ver @nexora/state. */
import { stateHandlers } from "@/site/server";

export const GET = stateHandlers.publicGET;
