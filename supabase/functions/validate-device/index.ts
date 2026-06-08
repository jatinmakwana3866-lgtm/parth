import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function createAdminClient() {
  return {
    async from(table: string) {
      const baseUrl = `${SUPABASE_URL}/rest/v1/${table}`;
      return {
        async select(query?: string) {
          const url = query ? `${baseUrl}?${query}` : baseUrl;
          const res = await fetch(url, {
            headers: {
              apikey: SERVICE_ROLE_KEY!,
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
          });
          return { data: await res.json(), error: !res.ok };
        },
        async insert(data: Record<string, unknown>) {
          const res = await fetch(baseUrl, {
            method: "POST",
            headers: {
              apikey: SERVICE_ROLE_KEY!,
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify(data),
          });
          return { data: await res.json(), error: !res.ok };
        },
        async update(data: Record<string, unknown>, query: string) {
          const res = await fetch(`${baseUrl}?${query}`, {
            method: "PATCH",
            headers: {
              apikey: SERVICE_ROLE_KEY!,
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify(data),
          });
          return { data: await res.json(), error: !res.ok };
        },
      };
    },
    async rpc(fn: string, params: Record<string, unknown>) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      return { data: await res.json(), error: !res.ok };
    },
  };
}

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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the JWT token
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!verifyRes.ok) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authUser = await verifyRes.json();
    const uid = authUser.id;

    const body = await req.json();
    const { deviceId, email } = body;

    if (!deviceId || !email) {
      return new Response(JSON.stringify({ error: "Missing deviceId or email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createAdminClient();

    // Check device registry
    const { data: deviceRows } = await admin
      .from("device_registry")
      .select(`device_id=eq.${deviceId}`);

    const existingDevice = (deviceRows as Record<string, unknown>[])?.[0];

    // Log the attempt
    await admin.from("security_logs").insert({
      device_id: deviceId,
      email,
      auth_uid: uid,
      action: "validate_device_claim",
      result: existingDevice ? "existing_device" : "new_device",
      account_count: existingDevice ? (existingDevice.account_count as number) + 1 : 1,
    });

    if (!existingDevice) {
      // First time device - create registry entry and credit token
      await admin.from("device_registry").insert({
        device_id: deviceId,
        first_email: email,
        account_count: 1,
        tokens_claimed: 1,
        flagged: false,
        flag_reason: "",
        email_history: [email],
      });

      // Credit 1 token to user
      const { data: userRows } = await admin
        .from("users")
        .select(`auth_uid=eq.${uid}`);

      const user = (userRows as Record<string, unknown>[])?.[0];
      if (user) {
        await admin
          .from("users")
          .update({ tokens: (user.tokens as number) + 1, device_id: deviceId }, `auth_uid=eq.${uid}`);

        await admin.from("transactions").insert({
          user_uid: uid,
          type: "gift",
          text: "Welcome gift",
          delta: "+1",
        });
      }

      return new Response(JSON.stringify({ granted: true, tokens: 1 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Device exists - increment account count, add email to history
    const currentEmails = (existingDevice.email_history as string[]) || [];
    const updatedEmails = currentEmails.includes(email) ? currentEmails : [...currentEmails, email];

    await admin
      .from("device_registry")
      .update(
        {
          account_count: (existingDevice.account_count as number) + 1,
          last_seen_at: new Date().toISOString(),
          email_history: updatedEmails,
        },
        `device_id=eq.${deviceId}`
      );

    if ((existingDevice.tokens_claimed as number) >= 1) {
      // Already claimed - flag and deny
      await admin
        .from("device_registry")
        .update(
          { flagged: true, flag_reason: "duplicate_device" },
          `device_id=eq.${deviceId}`
        );

      return new Response(
        JSON.stringify({ granted: false, reason: "already_claimed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Edge case: tokens_claimed === 0
    await admin
      .from("device_registry")
      .update({ tokens_claimed: 1 }, `device_id=eq.${deviceId}`);

    const { data: userRows2 } = await admin
      .from("users")
      .select(`auth_uid=eq.${uid}`);

    const user2 = (userRows2 as Record<string, unknown>[])?.[0];
    if (user2) {
      await admin
        .from("users")
        .update({ tokens: (user2.tokens as number) + 1, device_id: deviceId }, `auth_uid=eq.${uid}`);

      await admin.from("transactions").insert({
        user_uid: uid,
        type: "gift",
        text: "Welcome gift",
        delta: "+1",
      });
    }

    return new Response(JSON.stringify({ granted: true, tokens: 1 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
