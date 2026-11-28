/** POST /api/upload: fotos del panel al Blob privado. Ver @nexora/media. */
import { mediaHandlers } from "@/site/server";

export const POST = mediaHandlers.uploadPOST;
