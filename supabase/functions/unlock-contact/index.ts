import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify JWT
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
    });

    if (!verifyRes.ok) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authUser = await verifyRes.json();
    const buyerUid = authUser.id;

    const body = await req.json();
    const { targetUserId, targetUserRole } = body;

    if (!targetUserId || !targetUserRole) {
      return new Response(JSON.stringify({ error: "Missing targetUserId or targetUserRole" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cost = targetUserRole === "vyapari" ? 10 : 1;

    // Read buyer's current token balance
    const buyerRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?auth_uid=eq.${buyerUid}&select=tokens`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const buyerRows = await buyerRes.json() as Record<string, unknown>[];
    const buyer = buyerRows?.[0];

    if (!buyer) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentBalance = buyer.tokens as number;

    if (currentBalance < cost) {
      return new Response(
        JSON.stringify({ error: "insufficient_tokens", balance: currentBalance, cost }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if already unlocked
    const unlockCheckRes = await fetch(
      `${SUPABASE_URL}/rest/v1/unlocks?buyer_uid=eq.${buyerUid}&target_uid=eq.${targetUserId}&select=id`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const existingUnlocks = await unlockCheckRes.json() as Record<string, unknown>[];
    if (existingUnlocks && existingUnlocks.length > 0) {
      return new Response(
        JSON.stringify({ error: "already_unlocked", newBalance: currentBalance }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Deduct tokens atomically
    const newBalance = currentBalance - cost;

    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?auth_uid=eq.${buyerUid}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ tokens: newBalance }),
      }
    );

    if (!updateRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to deduct tokens" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create unlock record
    await fetch(`${SUPABASE_URL}/rest/v1/unlocks`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        buyer_uid: buyerUid,
        target_uid: targetUserId,
        cost,
      }),
    });

    // Add transaction record
    await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_uid: buyerUid,
        type: "spend",
        text: `Unlocked contact`,
        delta: `-${cost}`,
      }),
    });

    return new Response(
      JSON.stringify({ success: true, newBalance }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
