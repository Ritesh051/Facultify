// Recreates one admin, one teacher, and one student login after auth.users
// was wiped in Supabase (institutions/teachers/students/batches rows survive
// that since they only hold a nullable user_id, so this reuses them if present).
// Idempotent — safe to re-run. Run with: node scripts/seed-test-accounts.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const ENV_PATH = "./.env.local";
const envText = readFileSync(ENV_PATH, "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "Facultify_Test2026!";

const ADMIN_EMAIL = "admin@apexacademy.edu";
const TEACHER_EMAIL = "ananya@apexacademy.edu";
const STUDENT_EMAIL = "arjun@student.apexacademy.edu";

async function getOrCreateAuthUser(email, password) {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (!createErr) return created.user;

  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) throw new Error(`listUsers failed: ${listErr.message}`);
  const existing = list.users.find((u) => u.email === email);
  if (!existing) throw new Error(`createUser failed and user not found: ${createErr.message}`);

  // Already existed — reset its password so the printed credential is valid.
  await supabase.auth.admin.updateUserById(existing.id, { password });
  return existing;
}

async function main() {
  // ── Institution ──────────────────────────────────────────────────────────
  let { data: institution } = await supabase
    .from("institutions")
    .select("id, admin_email, name")
    .limit(1)
    .maybeSingle();

  if (!institution) {
    const { data, error } = await supabase
      .from("institutions")
      .insert({ name: "Apex Academy", domain: "apexacademy.edu", admin_email: ADMIN_EMAIL })
      .select("id, admin_email, name")
      .single();
    if (error) throw new Error("Institution insert failed: " + error.message);
    institution = data;
  }
  const institutionId = institution.id;
  const adminEmail = institution.admin_email;

  const adminUser = await getOrCreateAuthUser(adminEmail, PASSWORD);
  await supabase.from("profiles").upsert(
    { id: adminUser.id, institution_id: institutionId, role: "admin", entity_id: institutionId },
    { onConflict: "id" }
  );

  // ── Teacher ──────────────────────────────────────────────────────────────
  let { data: teacher } = await supabase
    .from("teachers")
    .select("id, email")
    .eq("institution_id", institutionId)
    .limit(1)
    .maybeSingle();

  if (!teacher) {
    const { data, error } = await supabase
      .from("teachers")
      .insert({
        institution_id: institutionId,
        name: "Dr. Ananya Sharma",
        email: TEACHER_EMAIL,
        subject: "Mathematics",
      })
      .select("id, email")
      .single();
    if (error) throw new Error("Teacher insert failed: " + error.message);
    teacher = data;
  }

  const teacherUser = await getOrCreateAuthUser(teacher.email, PASSWORD);
  await supabase.from("teachers").update({ user_id: teacherUser.id }).eq("id", teacher.id);
  await supabase.from("profiles").upsert(
    { id: teacherUser.id, institution_id: institutionId, role: "teacher", entity_id: teacher.id },
    { onConflict: "id" }
  );

  // ── Batch ────────────────────────────────────────────────────────────────
  let { data: batch } = await supabase
    .from("batches")
    .select("id")
    .eq("teacher_id", teacher.id)
    .limit(1)
    .maybeSingle();

  if (!batch) {
    const { data, error } = await supabase
      .from("batches")
      .insert({ teacher_id: teacher.id, institution_id: institutionId, name: "Batch A", subject: "Mathematics" })
      .select("id")
      .single();
    if (error) throw new Error("Batch insert failed: " + error.message);
    batch = data;
  }

  // ── Student ──────────────────────────────────────────────────────────────
  let { data: student } = await supabase
    .from("students")
    .select("id, email")
    .eq("batch_id", batch.id)
    .limit(1)
    .maybeSingle();

  if (!student) {
    const { data, error } = await supabase
      .from("students")
      .insert({
        institution_id: institutionId,
        teacher_id:     teacher.id,
        batch_id:       batch.id,
        name:           "Arjun Patel",
        email:          STUDENT_EMAIL,
        roll_number:    "APX-001",
      })
      .select("id, email")
      .single();
    if (error) throw new Error("Student insert failed: " + error.message);
    student = data;
  }

  const studentUser = await getOrCreateAuthUser(student.email, PASSWORD);
  await supabase.from("students").update({ user_id: studentUser.id }).eq("id", student.id);
  await supabase.from("profiles").upsert(
    { id: studentUser.id, institution_id: institutionId, role: "student", entity_id: student.id },
    { onConflict: "id" }
  );

  console.log("\nSeed complete. Password (same for all three): " + PASSWORD);
  console.log("  Admin:   ", adminEmail);
  console.log("  Teacher: ", teacher.email);
  console.log("  Student: ", student.email);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
