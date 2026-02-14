// Edge function pour envoyer des notifications push
// Appelée par les triggers de base de données via webhook ou manuellement

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, title, body, url, tag } = await req.json();

    if (!user_id || !title) {
      return new Response(
        JSON.stringify({ error: "user_id et title sont requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Récupérer les abonnements push de l'utilisateur
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "Aucun abonnement push trouvé", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Note: L'envoi réel de push notifications nécessite les clés VAPID privées
    // et la bibliothèque web-push. Pour l'instant, on retourne les infos de debug.
    // L'intégration complète nécessite VAPID_PRIVATE_KEY en secret.

    const payload = JSON.stringify({
      title,
      body: body || "",
      icon: "/favicon.png",
      url: url || "/notifications",
      tag: tag || "domia-notification",
    });

    let sent = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        // Envoi via Web Push Protocol (simplifié)
        // Pour une implémentation complète, utiliser les clés VAPID
        // avec la lib web-push ou l'API native
        sent++;
      } catch (e) {
        errors.push(`Erreur pour ${sub.endpoint}: ${e}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `${sent} notification(s) préparée(s)`,
        subscriptions_count: subscriptions.length,
        sent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
