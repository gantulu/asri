import { handleDuitkuRoute } from "../_shared/duitku.ts";

Deno.serve(async (req: Request) => {
  const path = new URL(req.url).pathname;
  const route = path.endsWith("/callback")
    ? "callback"
    : path.endsWith("/create")
      ? "create"
      : path.endsWith("/payment-methods")
        ? "payment-methods"
        : path.endsWith("/payment-status")
          ? "payment-status"
          : path.endsWith("/status")
            ? "status"
            : null;

  if (!route) {
    return new Response(JSON.stringify({
      service: "asri-duitku",
      status: "ok",
      routes: ["/create", "/payment-methods", "/status", "/callback", "/payment-status"],
    }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  return await handleDuitkuRoute(route, req);
});
