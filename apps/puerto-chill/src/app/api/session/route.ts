/** GET/POST/DELETE /api/session: sesión del panel. Ver @nexora/auth. */
import { sessionHandlers } from "@/site/server";

export const GET = sessionHandlers.GET;
export const POST = sessionHandlers.POST;
export const DELETE = sessionHandlers.DELETE;
