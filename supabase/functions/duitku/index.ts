import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const merchantCode = Deno.env.get("DUITKU_MERCHANT_CODE");
const apiKey = Deno.env.get("DUITKU_API_KEY");
const environment = Deno.env.get("DUITKU_ENVIRONMENT") ?? "sandbox";
const callbackUrl = Deno.env.get("DUITKU_CALLBACK_URL");
const returnUrl = Deno.env.get("DUITKU_RETURN_URL");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase server configuration");
}

const db = createClient(supabaseUrl, serviceRoleKey);

const DUITKU_BASE =
  environment === "production"
    ? "https://passport.duitku.com"
    : "https://sandbox.duitku.com";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

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
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

function requiredConfig() {
  if (!merchantCode || !apiKey || !callbackUrl || !returnUrl) {
    throw new Error(
      "Missing DUITKU_MERCHANT_CODE, DUITKU_API_KEY, DUITKU_CALLBACK_URL or DUITKU_RETURN_URL",
    );
  }
}

function integerAmount(value: unknown): number {
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("paymentAmount must be a positive integer");
  }
  return amount;
}

async function requireUser(req: Request): Promise<string> {
  const authorization = req.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) throw new Error("Authorization required");

  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid authorization");

  return data.user.id;
}

async function duitkuRequest(
  path: string,
  body: unknown,
  contentType = "application/json",
): Promise<{ status: number; data: Record<string, unknown> }> {
  const response = await fetch(DUITKU_BASE + path, {
    method: "POST",
    headers: { "content-type": contentType },
    body: contentType === "application/json"
      ? JSON.stringify(body)
      : new URLSearchParams(body as Record<string, string>).toString(),
  });

  const text = await response.text();
  let data: Record<string, unknown> = {};

  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return { status: response.status, data };
}

function newMerchantOrderId(): string {
  return "ASRI-" + crypto.randomUUID().replaceAll("-", "").slice(0, 32);
}

async function createPayment(req: Request): Promise<Response> {
  requiredConfig();

  const userId = await requireUser(req);
  const input = await req.json();

  const amount = integerAmount(input.paymentAmount);
  const paymentMethod = String(input.paymentMethod ?? "").trim();
  const productDetails = String(input.productDetails ?? "").trim();
  const email = String(input.email ?? "").trim();
  const customerVaName = String(input.customerVaName ?? "").trim();

  if (!paymentMethod || paymentMethod.length > 2) {
    return json({ error: "Invalid paymentMethod" }, 400);
  }

  if (!productDetails || productDetails.length > 255) {
    return json({ error: "Invalid productDetails" }, 400);
  }

  if (!email || email.length > 255) {
    return json({ error: "Invalid email" }, 400);
  }

  if (!customerVaName || customerVaName.length > 20) {
    return json({ error: "Invalid customerVaName" }, 400);
  }

  const itemDetails = Array.isArray(input.itemDetails)
    ? input.itemDetails
    : undefined;

  if (itemDetails) {
    const itemTotal = itemDetails.reduce((sum: number, item: Record<string, unknown>) => {
      const price = integerAmount(item.price);
      const quantity = integerAmount(item.quantity);
      return sum + price * quantity;
    }, 0);

    if (itemTotal !== amount) {
      return json({
        error: "itemDetails total must equal paymentAmount",
      }, 400);
    }
  }

  const merchantOrderId = newMerchantOrderId();
  const additionalParam = input.additionalParam
    ? String(input.additionalParam)
    : null;
  const merchantUserInfo = input.merchantUserInfo
    ? String(input.merchantUserInfo)
    : null;
  const phoneNumber = input.phoneNumber ? String(input.phoneNumber) : null;
  const expiryPeriod = input.expiryPeriod == null
    ? null
    : integerAmount(input.expiryPeriod);

  const signature = await hmacSha256(
    merchantCode + merchantOrderId + amount,
    apiKey,
  );

  const orderInsert = {
    merchant_order_id: merchantOrderId,
    user_id: userId,
    amount,
    currency: "IDR",
    status: "pending",
    product_details: productDetails,
    customer_email: email,
    customer_phone: phoneNumber,
    customer_va_name: customerVaName,
    additional_param: additionalParam,
    merchant_user_info: merchantUserInfo,
    payment_method: paymentMethod,
    callback_url: callbackUrl,
    return_url: returnUrl,
    expiry_period: expiryPeriod,
    provider: "duitku",
  };

  const { data: order, error: insertError } = await db
    .from("payment_orders")
    .insert(orderInsert)
    .select("id, merchant_order_id, amount, status")
    .single();

  if (insertError) {
    return json({ error: insertError.message }, 500);
  }

  const payload: Record<string, unknown> = {
    merchantCode,
    paymentAmount: amount,
    paymentMethod,
    merchantOrderId,
    productDetails,
    email,
    customerVaName,
    callbackUrl,
    returnUrl,
    signature,
  };

  if (phoneNumber) payload.phoneNumber = phoneNumber;
  if (additionalParam) payload.additionalParam = additionalParam;
  if (merchantUserInfo) payload.merchantUserInfo = merchantUserInfo;
  if (expiryPeriod != null) payload.expiryPeriod = expiryPeriod;
  if (itemDetails) payload.itemDetails = itemDetails;
  if (input.customerDetail) payload.customerDetail = input.customerDetail;
  if (input.accountLink) payload.accountLink = input.accountLink;
  if (input.creditCardDetail) payload.creditCardDetail = input.creditCardDetail;

  const provider = await duitkuRequest(
    "/webapi/api/merchant/v2/inquiry",
    payload,
  );

  const providerData = provider.data;
  const providerStatus = String(providerData.statusCode ?? "");

  if (
    provider.status < 200 ||
    provider.status >= 300 ||
    providerStatus !== "00"
  ) {
    await db
      .from("payment_orders")
      .update({
        status: "creation_failed",
        failed_at: new Date().toISOString(),
        failure_reason: String(
          providerData.statusMessage ?? "Duitku inquiry failed",
        ),
        provider_status_code: providerStatus || null,
        provider_status_message: String(providerData.statusMessage ?? "") || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return json({
      error: "Duitku inquiry failed",
      orderId: order.id,
      merchantOrderId,
      provider: providerData,
    }, 502);
  }

  const providerAmount = integerAmount(providerData.amount);
  if (providerAmount !== amount) {
    await db
      .from("payment_orders")
      .update({
        status: "creation_failed",
        failed_at: new Date().toISOString(),
        failure_reason: "Duitku returned an unexpected amount",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return json({ error: "Provider amount mismatch" }, 502);
  }

  const { error: updateError } = await db
    .from("payment_orders")
    .update({
      provider_reference: String(providerData.reference ?? "") || null,
      payment_url: String(providerData.paymentUrl ?? "") || null,
      va_number: String(providerData.vaNumber ?? "") || null,
      qr_string: String(providerData.qrString ?? "") || null,
      app_url: String(providerData.appUrl ?? providerData.AppUrl ?? "") || null,
      provider_status_code: providerStatus,
      provider_status_message: String(providerData.statusMessage ?? "") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) return json({ error: updateError.message }, 500);

  return json({
    orderId: order.id,
    merchantOrderId,
    amount,
    status: "pending",
    reference: providerData.reference ?? null,
    paymentUrl: providerData.paymentUrl ?? null,
    vaNumber: providerData.vaNumber ?? null,
    qrString: providerData.qrString ?? null,
    appUrl: providerData.appUrl ?? providerData.AppUrl ?? null,
  });
}

async function paymentMethods(req: Request): Promise<Response> {
  requiredConfig();
  await requireUser(req);

  const input = await req.json();
  const amount = integerAmount(input.amount);
  const datetime = new Date()
    .toISOString()
    .replace("T", " ")
    .replace("Z", "")
    .slice(0, 19);

  const signature = await hmacSha256(
    merchantCode + amount + datetime,
    apiKey,
  );

  return json(
    await duitkuRequest(
      "/webapi/api/merchant/paymentmethod/getpaymentmethod",
      {
        merchantcode: merchantCode,
        amount,
        datetime,
        signature,
      },
    ),
  );
}

async function transactionStatus(req: Request): Promise<Response> {
  requiredConfig();
  await requireUser(req);

  const input = await req.json();
  const merchantOrderId = String(input.merchantOrderId ?? "").trim();

  if (!merchantOrderId) {
    return json({ error: "merchantOrderId is required" }, 400);
  }

  const signature = await hmacSha256(
    merchantCode + merchantOrderId,
    apiKey,
  );

  const provider = await duitkuRequest(
    "/webapi/api/merchant/transactionStatus",
    {
      merchantCode,
      merchantOrderId,
      signature,
    },
  );

  const providerData = provider.data;
  const statusCode = String(providerData.statusCode ?? "");
  const amount = Number(providerData.amount);

  const { data: order } = await db
    .from("payment_orders")
    .select("id, amount, status")
    .eq("merchant_order_id", merchantOrderId)
    .maybeSingle();

  if (order && Number.isSafeInteger(amount) && amount === order.amount) {
    const mappedStatus =
      statusCode === "00"
        ? "paid"
        : statusCode === "02"
          ? "cancelled"
          : "pending";

    if (!(order.status === "paid" && mappedStatus !== "paid")) {
      await db
        .from("payment_orders")
        .update({
          status: mappedStatus,
          provider_reference: String(providerData.reference ?? "") || null,
          provider_status_code: statusCode || null,
          provider_status_message: String(providerData.statusMessage ?? "") || null,
          paid_at: mappedStatus === "paid"
            ? new Date().toISOString()
            : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    }
  }

  return json(providerData, provider.status);
}

async function callback(req: Request): Promise<Response> {
  requiredConfig();

  const contentType = req.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await req.json()
    : Object.fromEntries(new URLSearchParams(await req.text()));

  const get = (key: string) => String(payload[key] ?? "");

  const callbackMerchantCode = get("merchantCode");
  const amount = get("amount");
  const merchantOrderId = get("merchantOrderId");
  const signature = get("signature");

  if (!callbackMerchantCode || !amount || !merchantOrderId || !signature) {
    return new Response("Bad Parameter", { status: 400 });
  }

  const expected = await hmacSha256(
    callbackMerchantCode + amount + merchantOrderId,
    apiKey,
  );

  const signatureValid =
    callbackMerchantCode === merchantCode &&
    safeEqual(signature, expected);

  const callbackRow = {
    merchant_order_id: merchantOrderId,
    signature,
    signature_valid: signatureValid,
    result_code: get("resultCode") || null,
    payment_code: get("paymentCode") || null,
    reference: get("reference") || null,
    publisher_order_id: get("publisherOrderId") || null,
    sp_user_hash: get("spUserHash") || null,
    settlement_date: get("settlementDate") || null,
    issuer_code: get("issuerCode") || null,
    customer_name: get("customerName") || null,
    payload,
    processing_status: signatureValid ? "received" : "rejected",
    http_status: signatureValid ? 200 : 401,
  };

  const { error: callbackError } = await db
    .from("payment_callbacks")
    .insert(callbackRow);

  if (callbackError) {
    console.error("callback audit insert failed", callbackError);
  }

  if (!signatureValid) {
    return new Response("Bad Signature", { status: 401 });
  }

  const { data: order, error: orderError } = await db
    .from("payment_orders")
    .select("id, amount, status")
    .eq("merchant_order_id", merchantOrderId)
    .maybeSingle();

  if (orderError) {
    console.error(orderError);
    return new Response("Server Error", { status: 500 });
  }

  if (!order) {
    return new Response("Order Not Found", { status: 404 });
  }

  if (Number(order.amount) !== Number(amount)) {
    return new Response("Amount Mismatch", { status: 400 });
  }

  const resultCode = get("resultCode");
  const nextStatus = resultCode === "00" ? "paid" : "failed";

  const transaction = {
    order_id: order.id,
    provider: "duitku",
    provider_reference: get("reference") || null,
    payment_code: get("paymentCode") || null,
    payment_method: get("paymentCode") || null,
    amount: Number(amount),
    status_code: resultCode || null,
    status_message: resultCode === "00" ? "SUCCESS" : "FAILED",
    publisher_order_id: get("publisherOrderId") || null,
    settlement_date_text: get("settlementDate") || null,
    issuer_code: get("issuerCode") || null,
    customer_name: get("customerName") || null,
    raw_response: payload,
    updated_at: new Date().toISOString(),
  };

  if (transaction.provider_reference) {
    await db
      .from("payment_transactions")
      .upsert(transaction, {
        onConflict: "provider,provider_reference",
        ignoreDuplicates: false,
      });
  } else {
    await db.from("payment_transactions").insert(transaction);
  }

  // Paid is monotonic. A later failed/duplicate callback cannot regress it.
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    provider_reference: get("reference") || null,
    provider_status_code: resultCode || null,
    provider_status_message: nextStatus === "paid" ? "SUCCESS" : "FAILED",
  };

  if (order.status !== "paid") {
    update.status = nextStatus;
    if (nextStatus === "paid") update.paid_at = new Date().toISOString();
    if (nextStatus === "failed") update.failed_at = new Date().toISOString();
  }

  const { error: updateError } = await db
    .from("payment_orders")
    .update(update)
    .eq("id", order.id);

  if (updateError) {
    console.error(updateError);
    return new Response("Server Error", { status: 500 });
  }

  await db
    .from("payment_callbacks")
    .update({
      processing_status: "processed",
      processed_at: new Date().toISOString(),
      http_status: 200,
    })
    .eq("merchant_order_id", merchantOrderId)
    .eq("signature", signature);

  // Duitku retries callbacks when it does not receive HTTP 200.
  return new Response("OK", { status: 200 });
}

Deno.serve(async (req) => {
  const path = new URL(req.url).pathname;

  try {
    if (req.method === "POST" && path.endsWith("/callback")) {
      return await callback(req);
    }

    if (req.method === "POST" && path.endsWith("/create")) {
      return await createPayment(req);
    }

    if (req.method === "POST" && path.endsWith("/payment-methods")) {
      return await paymentMethods(req);
    }

    if (req.method === "POST" && path.endsWith("/status")) {
      return await transactionStatus(req);
    }

    return json({
      service: "asri-duitku",
      status: "ok",
      environment,
      routes: [
        "POST /create",
        "POST /payment-methods",
        "POST /status",
        "POST /callback",
      ],
    });
  } catch (error) {
    console.error(error);
    return json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      500,
    );
  }
});
