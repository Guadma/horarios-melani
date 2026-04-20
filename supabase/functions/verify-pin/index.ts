// Edge Function: verify-pin
// Recibe { pin } y devuelve un JWT firmado con el secret del proyecto Supabase
// si el PIN coincide con MELANI_PIN. Claim app_role="editor" se usa para RLS.
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, apikey, Authorization"
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido" }, 405);
  }

  let pin: unknown;
  try {
    const body = await req.json();
    pin = body?.pin;
  } catch {
    return jsonResponse({ error: "Body inválido" }, 400);
  }

  const expectedPin = Deno.env.get("MELANI_PIN");
  const secret = Deno.env.get("JWT_SECRET");

  if (!expectedPin || !secret) {
    return jsonResponse({ error: "Configuración incompleta" }, 500);
  }

  if (typeof pin !== "string" || pin !== expectedPin) {
    return jsonResponse({ error: "PIN incorrecto" }, 401);
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  // Payload compatible con Supabase/PostgREST:
  // - role="authenticated" → rol PG real del proyecto (evita intento de SET ROLE editor)
  // - app_role="editor"    → claim custom chequeado por las políticas RLS
  const token = await create(
    { alg: "HS256", typ: "JWT" },
    {
      role: "authenticated",
      app_role: "editor",
      exp: getNumericDate(60 * 60 * 8) // 8 horas
    },
    key
  );

  return jsonResponse({ token });
});
