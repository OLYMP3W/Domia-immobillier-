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

    const { property_id, title, city, price } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "title requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get ALL push subscriptions (broadcast to everyone)
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("user_id");

    if (error) throw error;

    const userIds = [...new Set(subscriptions?.map(s => s.user_id) || [])];

    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ message: "Aucun abonné", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the main send-push-notification function with all user IDs
    const priceFormatted = price ? `${Number(price).toLocaleString('fr-FR')} CFA` : '';
    const pushBody = `${title}${city ? ' à ' + city : ''}${priceFormatted ? ' - ' + priceFormatted : ''}`;

    const { data: result, error: pushError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        user_ids: userIds,
        title: '🏠 Nouvelle annonce !',
        body: pushBody,
        url: property_id ? `/property/${property_id}` : '/',
        tag: 'new-property',
      },
    });

    return new Response(
      JSON.stringify({ message: "Broadcast envoyé", result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
