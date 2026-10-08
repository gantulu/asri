import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const merchantCode = Deno.env.get("DUITKU_MERCHANT_CODE");
const apiKey = Deno.env.get("DUITKU_API_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase configuration");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function hex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );

  return hex(new Uint8Array(signature));
}

function safeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a.toLowerCase());
  const right = new TextEncoder().encode(b.toLowerCase());

  if (left.length !== right.length) return false;

  let diff = 0;
  for (let i = 0; i < left.length; i++) {
    diff |= left[i] ^ right[i];
  }

  return diff === 0;
}

function response(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function readCallback(req: Request): Promise<Record<string, unknown>> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await req.json();
  }

  const body = await req.text();
  return Object.fromEntries(new URLSearchParams(body));
}

async function callback(req: Request): Promise<Response> {
  if (!merchantCode || !apiKey) {
    return response({ error: "Duitku configuration is incomplete" }, 500);
  }

  const payload = await readCallback(req);

  const callbackMerchantCode = String(payload.merchantCode ?? "");
  const amount = String(payload.amount ?? "");
  const merchantOrderId = String(payload.merchantOrderId ?? "");
  const signature = String(payload.signature ?? "");

  if (!callbackMerchantCode || !amount || !merchantOrderId || !signature) {
    return response({ error: "Invalid callback payload" }, 400);
  }

  // Verify this formula against the current official Duitku documentation
  // before production deployment.
  const stringToSign =
    callbackMerchantCode + amount + merchantOrderId;

  const expectedSignature = await hmacSha256(stringToSign, apiKey);

  const valid =
    callbackMerchantCode === merchantCode &&
    safeEqual(signature, expectedSignature);

  await supabase.from("payment_callbacks").insert({
    merchant_order_id: merchantOrderId,
    signature,
    signature_valid: valid,
    result_code: String(payload.resultCode ?? ""),
    payload,
    processing_status: valid ? "received" : "rejected",
  });

  if (!valid) {
    return response({ error: "Invalid signature" }, 401);
  }

  const { data: order, error } = await supabase
    .from("payment_orders")
    .select("id, amount, status")
    .eq("merchant_order_id", merchantOrderId)
    .maybeSingle();

  if (error) return response({ error: error.message }, 500);
  if (!order) return response({ error: "Order not found" }, 404);

  if (Number(order.amount) !== Number(amount)) {
    return response({ error: "Amount mismatch" }, 400);
  }

  const resultCode = String(payload.resultCode ?? "");
  const nextStatus = resultCode === "00" ? "paid" : "failed";

  // V1 keeps paid monotonic so a duplicate/late callback cannot
  // move an already-paid order back to failed.
  if (order.status !== "paid") {
    const { error: updateError } = await supabase
      .from("payment_orders")
      .update({
        status: nextStatus,
        paid_at: nextStatus === "paid"
          ? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) return response({ error: updateError.message }, 500);
  }

  return new Response("OK", { status: 200 });
}

async function createPayment(): Promise<Response> {
  return response({
    service: "asri-duitku",
    message: "Create-payment scaffold",
    configured: Boolean(merchantCode && apiKey),
    note:
      "Implement the exact current Duitku inquiry request/signature contract after provider documentation verification.",
  });
}

Deno.serve(async (req) => {
  const path = new URL(req.url).pathname;

  try {
    if (req.method === "POST" && path.endsWith("/callback")) {
      return await callback(req);
    }

    if (req.method === "POST" && path.endsWith("/create")) {
      return await createPayment();
    }

    return response({
      service: "asri-duitku",
      status: "ok",
      routes: ["POST /create", "POST /callback"],
    });
  } catch (error) {
    console.error(error);
    return response({ error: "Internal server error" }, 500);
  }
});
