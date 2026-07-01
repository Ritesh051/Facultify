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
    console.error("[finalize] getUser returned null — session cookies missing");
    return NextResponse.json({ error: "Not authenticated" });
  }

  const adminDb = createAdminDb();
  const email = (user.email ?? "").toLowerCase();
  console.log("[finalize] user.id:", user.id, "email:", email);

  const { data: teacher, error: teacherErr } = await adminDb
    .from("teachers")
    .select("id, institution_id")
    .ilike("email", email)
    .maybeSingle();
  console.log("[finalize] teacher lookup →", teacher, "error:", teacherErr);

  if (teacher) {
    await adminDb.from("profiles").upsert(
      { id: user.id, institution_id: teacher.institution_id, role: "teacher", entity_id: teacher.id },
      { onConflict: "id" }
    );
    await adminDb.from("teachers").update({ user_id: user.id }).eq("id", teacher.id);
    return NextResponse.json({ destination: "/teacher" });
  }

  const { data: student } = await adminDb
    .from("students")
    .select("id, institution_id")
    .ilike("email", email)        // same fix
    .maybeSingle();

  if (student) {
    await adminDb.from("profiles").upsert(
      { id: user.id, institution_id: student.institution_id, role: "student", entity_id: student.id },
      { onConflict: "id" }
    );
    await adminDb.from("students").update({ user_id: user.id }).eq("id", student.id);
    return NextResponse.json({ destination: "/student" });
  }

  // Existing profile — route directly to their dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "teacher") return NextResponse.json({ destination: "/teacher" });
  if (profile?.role === "student") return NextResponse.json({ destination: "/student" });
  if (profile?.role === "admin")   return NextResponse.json({ destination: "/admin" });

  return NextResponse.json({ destination: "/onboard" });
}
