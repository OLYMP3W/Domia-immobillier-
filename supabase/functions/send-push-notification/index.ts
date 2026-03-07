import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createVapidAuthHeader(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  subject: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const publicKeyBytes = base64UrlToUint8Array(vapidPublicKey);

  const jwk = {
    kty: "EC",
    crv: "P-256",
    d: vapidPrivateKey,
    x: uint8ArrayToBase64Url(publicKeyBytes.slice(1, 33)),
    y: uint8ArrayToBase64Url(publicKeyBytes.slice(33, 65)),
  };

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 86400,
    sub: subject,
  };

  const encoder = new TextEncoder();
  const headerB64 = uint8ArrayToBase64Url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    encoder.encode(unsignedToken)
  );

  const sigBytes = new Uint8Array(signature);
  const token = `${unsignedToken}.${uint8ArrayToBase64Url(sigBytes)}`;

  return {
    authorization: `vapid t=${token}, k=${vapidPublicKey}`,
    cryptoKey: `p256ecdsa=${vapidPublicKey}`,
  };
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  subject: string
): Promise<Response> {
  const { authorization } = await createVapidAuthHeader(
    subscription.endpoint,
    vapidPublicKey,
    vapidPrivateKey,
    subject
  );

  return await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Authorization": authorization,
      "TTL": "86400",
      "Content-Type": "application/json",
      "Content-Length": new TextEncoder().encode(payload).length.toString(),
    },
    body: payload,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!vapidPrivateKey || !vapidPublicKey) {
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured", needs_setup: true }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { user_id, user_ids, title, body: msgBody, url, tag } = body;

    // Support single user_id or array of user_ids for broadcast
    const targetUserIds: string[] = user_ids || (user_id ? [user_id] : []);

    if (targetUserIds.length === 0 || !title) {
      return new Response(
        JSON.stringify({ error: "user_id(s) et title requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get push subscriptions for all target users
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", targetUserIds);

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "Aucun abonnement push trouvé", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({
      title,
      body: msgBody || "",
      icon: "/favicon.png",
      url: url || "/notifications",
      tag: tag || "domia-notification",
    });

    let sent = 0;
    const errors: string[] = [];

    // Send in parallel batches of 10
    const batchSize = 10;
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (sub) => {
          const response = await sendWebPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload,
            vapidPublicKey,
            vapidPrivateKey,
            "mailto:contact@domia.ga"
          );

          if (response.ok || response.status === 201) {
            sent++;
          } else if (response.status === 410 || response.status === 404) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          } else {
            const text = await response.text();
            errors.push(`${response.status}: ${text.slice(0, 80)}`);
          }
        })
      );
    }

    return new Response(
      JSON.stringify({ sent, total: subscriptions.length, errors: errors.length > 0 ? errors : undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
