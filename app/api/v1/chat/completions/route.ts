import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashApiKey } from "@/lib/apiKeys";
import { resolveProvider } from "@/lib/models";

// This is YOUR public endpoint. Clients call:
//   POST https://<your-site>/api/v1/chat/completions
//   Authorization: Bearer sk-gw-xxxxxxxx   (a key issued by YOUR dashboard)
// Your server then calls Groq or OpenRouter using YOUR secret keys
// (GROQ_API_KEY / OPENROUTER_API_KEY, stored only in Vercel env vars).
// The upstream provider keys are NEVER sent to the client.

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const clientKey = authHeader.replace("Bearer ", "").trim();

  if (!clientKey.startsWith("sk-gw-")) {
    return NextResponse.json({ error: "Missing or malformed API key" }, { status: 401 });
  }

  const keyHash = hashApiKey(clientKey);
  const { data: keyRow } = await supabaseAdmin
    .from("api_keys")
    .select("id, status")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (!keyRow || keyRow.status !== "active") {
    return NextResponse.json({ error: "Invalid, revoked, or hidden API key" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.model || !Array.isArray(body?.messages)) {
    return NextResponse.json({ error: "Request must include 'model' and 'messages'" }, { status: 400 });
  }

  const provider = resolveProvider(body.model);
  if (!provider) {
    return NextResponse.json(
      { error: `Unknown or unsupported model: ${body.model}. See /api/v1/models for the list.` },
      { status: 400 }
    );
  }

  const providerUrl =
    provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions";

  const providerKey = provider === "groq" ? process.env.GROQ_API_KEY : process.env.OPENROUTER_API_KEY;

  if (!providerKey) {
    return NextResponse.json({ error: `Server is missing the ${provider.toUpperCase()}_API_KEY env var` }, { status: 500 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(providerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${providerKey}`,
        ...(provider === "openrouter"
          ? {
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://vercel.app",
              "X-Title": "My API Gateway",
            }
          : {}),
      },
      body: JSON.stringify({
        model: body.model,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 1024,
        stream: false,
      }),
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Upstream provider request failed: ${err.message}` }, { status: 502 });
  }

  const data = await upstream.json().catch(() => ({}));

  supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRow.id)
    .then(() => {});

  supabaseAdmin
    .from("usage_logs")
    .insert({
      api_key_id: keyRow.id,
      provider,
      model: body.model,
      prompt_tokens: data?.usage?.prompt_tokens ?? 0,
      completion_tokens: data?.usage?.completion_tokens ?? 0,
      status_code: upstream.status,
    })
    .then(() => {});

  return NextResponse.json(data, { status: upstream.status });
}
