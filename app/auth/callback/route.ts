import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

function createAdminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const url  = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url));
  }

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

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/auth/login?error=exchange_failed", request.url));
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const adminDb = createAdminDb();
  const email = (user.email ?? "").toLowerCase();

  const { data: teacher } = await adminDb
    .from("teachers")
    .select("id, institution_id")
    .ilike("email", email)
    .maybeSingle();

  if (teacher) {
    await adminDb.from("profiles").upsert(
      { id: user.id, institution_id: teacher.institution_id, role: "teacher", entity_id: teacher.id },
      { onConflict: "id" }
    );
    await adminDb.from("teachers").update({ user_id: user.id }).eq("id", teacher.id);
    return NextResponse.redirect(new URL("/teacher", request.url));
  }

  const { data: student } = await adminDb
    .from("students")
    .select("id, institution_id")
    .ilike("email", email)
    .maybeSingle();

  if (student) {
    await adminDb.from("profiles").upsert(
      { id: user.id, institution_id: student.institution_id, role: "student", entity_id: student.id },
      { onConflict: "id" }
    );
    await adminDb.from("students").update({ user_id: user.id }).eq("id", student.id);
    return NextResponse.redirect(new URL("/student", request.url));
  }

  // Existing profile — route directly to their dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "teacher") return NextResponse.redirect(new URL("/teacher", request.url));
  if (profile?.role === "student") return NextResponse.redirect(new URL("/student", request.url));
  if (profile?.role === "admin")   return NextResponse.redirect(new URL("/admin",   request.url));

  return NextResponse.redirect(new URL("/onboard", request.url));
}
