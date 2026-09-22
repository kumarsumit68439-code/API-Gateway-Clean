import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/getUser";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function assertOwnership(userId: string, keyId: string) {
  const { data } = await supabaseAdmin
    .from("api_keys")
    .select("id")
    .eq("id", keyId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

// Update status: "active" | "revoked" | "hidden"
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertOwnership(user.id, params.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { status } = await req.json();
  if (!["active", "revoked", "hidden"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("api_keys")
    .update({
      status,
      revoked_at: status === "revoked" ? new Date().toISOString() : null,
    })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertOwnership(user.id, params.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin.from("api_keys").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
