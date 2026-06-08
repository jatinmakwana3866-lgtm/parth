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
    const uid = authUser.id;

    const body = await req.json();
    const { deviceId, email } = body;

    if (!deviceId || !email) {
      return new Response(JSON.stringify({ error: "Missing deviceId or email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update device registry lastSeenAt and emailHistory
    const deviceRes = await fetch(
      `${SUPABASE_URL}/rest/v1/device_registry?device_id=eq.${deviceId}&select=*`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const deviceRows = await deviceRes.json() as Record<string, unknown>[];
    const existingDevice = deviceRows?.[0];

    if (existingDevice) {
      const currentEmails = (existingDevice.email_history as string[]) || [];
      const updatedEmails = currentEmails.includes(email) ? currentEmails : [...currentEmails, email];

      await fetch(
        `${SUPABASE_URL}/rest/v1/device_registry?device_id=eq.${deviceId}`,
        {
          method: "PATCH",
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            last_seen_at: new Date().toISOString(),
            email_history: updatedEmails,
          }),
        }
      );

      const flagged = existingDevice.flagged as boolean;
      const accountCount = existingDevice.account_count as number;

      // Log high-risk if flagged with many accounts
      if (flagged && accountCount > 3) {
        await fetch(`${SUPABASE_URL}/rest/v1/security_logs`, {
          method: "POST",
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_id: deviceId,
            email,
            auth_uid: uid,
            action: "login_high_risk",
            result: "flagged_device_many_accounts",
            account_count: accountCount,
          }),
        });
      }
    }

    // Check if user is suspended
    const userRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?auth_uid=eq.${uid}&select=suspended,tokens,role,name,city,email,verified,device_id`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const userRows = await userRes.json() as Record<string, unknown>[];
    const user = userRows?.[0];

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (user.suspended as boolean) {
      return new Response(
        JSON.stringify({ suspended: true, reason: "Account suspended. Contact support." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          tokens: user.tokens,
          city: user.city,
          verified: user.verified,
          deviceId: user.device_id,
        },
        deviceFlagged: existingDevice?.flagged || false,
        accountCount: existingDevice?.account_count || 0,
      }),
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
