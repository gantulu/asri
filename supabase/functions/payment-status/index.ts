import { handleDuitkuRoute } from "../_shared/duitku.ts";

Deno.serve((req: Request) => handleDuitkuRoute("payment-status", req));
