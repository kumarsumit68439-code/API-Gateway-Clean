import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/getUser";
import { generateApiKey } from "@/lib/apiKeys";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, name, key_prefix, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keys: data });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = (body.name as string) || "Default";

  const { fullKey, hash, display } = generateApiKey();

  const { error } = await supabaseAdmin.from("api_keys").insert({
    user_id: user.id,
    name,
    key_hash: hash,
    key_prefix: display,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // The plaintext key is returned ONCE. It is never retrievable again.
  return NextResponse.json({ apiKey: fullKey, prefix: display, name });
}
