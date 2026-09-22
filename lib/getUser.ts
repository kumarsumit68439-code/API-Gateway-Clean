import { getServerSession } from "next-auth";
// ⚠️ IMPORTANT: point this import at YOUR existing NextAuth config
// (the one already powering github-oauth-login). Common locations:
//   "@/app/api/auth/[...nextauth]/route"  or  "@/lib/auth"
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  // Adjust these field names to whatever your GitHub profile callback
  // actually stores on the session (id/sub, name, email, image).
  const githubId = String((session.user as any).id ?? session.user.email);

  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("github_id", githubId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabaseAdmin
    .from("users")
    .insert({
      github_id: githubId,
      github_username: session.user.name ?? "unknown",
      name: session.user.name,
      email: session.user.email,
      avatar_url: session.user.image,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}
