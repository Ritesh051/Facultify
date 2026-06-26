import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function createAdminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Called by /auth/confirm after the browser client processes a hash-based
// (implicit flow) magic link. The session is already in cookies at this point.
export async function POST() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" });
  }

  // Check unlinked invite rows FIRST — same priority logic as /auth/callback/route.ts.
  // Handles the case where the invited user already has a Supabase account
  // (e.g. signed up as admin) but was also invited as a teacher or student.
  const adminDb = createAdminDb();

  const { data: teacher } = await adminDb
    .from("teachers")
    .select("id, institution_id, user_id")
    .eq("email", user.email!)
    .maybeSingle();

  if (teacher && (!teacher.user_id || teacher.user_id === user.id)) {
    await adminDb.from("profiles").upsert(
      { id: user.id, institution_id: teacher.institution_id, role: "teacher", entity_id: teacher.id },
      { onConflict: "id" }
    );
    if (!teacher.user_id) {
      await adminDb.from("teachers").update({ user_id: user.id }).eq("id", teacher.id);
    }
    return NextResponse.json({ destination: "/teacher" });
  }

  const { data: student } = await adminDb
    .from("students")
    .select("id, institution_id, user_id")
    .eq("email", user.email!)
    .maybeSingle();

  if (student && (!student.user_id || student.user_id === user.id)) {
    await adminDb.from("profiles").upsert(
      { id: user.id, institution_id: student.institution_id, role: "student", entity_id: student.id },
      { onConflict: "id" }
    );
    if (!student.user_id) {
      await adminDb.from("students").update({ user_id: user.id }).eq("id", student.id);
    }
    return NextResponse.json({ destination: "/student" });
  }

  // No unlinked invite row → existing profile → send to their dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    const routes: Record<string, string> = { admin: "/admin", teacher: "/teacher", student: "/student" };
    return NextResponse.json({ destination: routes[profile.role] ?? "/" });
  }

  return NextResponse.json({ destination: "/onboard" });
}
