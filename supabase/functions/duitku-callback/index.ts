import { handleDuitkuRoute } from "../_shared/duitku.ts";

// Public provider webhook. Signature validation is enforced in the handler.
Deno.serve((req: Request) => handleDuitkuRoute("callback", req));
