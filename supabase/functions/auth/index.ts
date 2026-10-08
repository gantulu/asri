import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase server configuration");
}

const db = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "access-control-allow-origin": "https://asricollection.online",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function validateCredentials(phone: string, password: string): string | null {
  if (!phone) return "phone is required";
  if (!password) return "password is required";
  if (phone.length > 50) return "phone is too long";
  if (password.length > 255) return "password is too long";
  return null;
}

function publicUser(row: Record<string, unknown>) {
  return {
    user_id: row.user_id,
    name: row.name,
    phone: row.phone,
    created_at: row.created_at,
  };
}

async function register(req: Request): Promise<Response> {
  const input = await req.json();
  const name = clean(input.name);
  const phone = clean(input.phone);
  const password = String(input.password ?? "");

  if (!name) return json({ error: "name is required" }, 400);
  if (name.length > 120) return json({ error: "name is too long" }, 400);

  const credentialError = validateCredentials(phone, password);
  if (credentialError) return json({ error: credentialError }, 400);

  const { data, error } = await db
    .from("users")
    .insert({ name, phone, password })
    .select("user_id, name, phone, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return json({ error: "phone already registered" }, 409);
    }
    console.error("register failed", error);
    return json({ error: "registration failed" }, 500);
  }

  return json({ user: publicUser(data) }, 201);
}

async function login(req: Request): Promise<Response> {
  const input = await req.json();
  const phone = clean(input.phone);
  const password = String(input.password ?? "");

  const credentialError = validateCredentials(phone, password);
  if (credentialError) return json({ error: credentialError }, 400);

  const { data, error } = await db
    .from("users")
    .select("user_id, name, phone, password, created_at")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    console.error("login lookup failed", error);
    return json({ error: "login failed" }, 500);
  }

  if (!data || data.password !== password) {
    return json({ error: "invalid phone or password" }, 401);
  }

  return json({ user: publicUser(data) });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const path = new URL(req.url).pathname;

  try {
    if (req.method === "GET") {
      return json({
        service: "asri-auth",
        status: "ok",
        routes: ["POST /register", "POST /login"],
      });
    }

    if (req.method === "POST" && path.endsWith("/register")) {
      return await register(req);
    }

    if (req.method === "POST" && path.endsWith("/login")) {
      return await login(req);
    }

    return json({ error: "Not Found" }, 404);
  } catch (error) {
    console.error(error);
    return json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      500,
    );
  }
});
