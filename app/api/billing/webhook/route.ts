import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "@/lib/supabase-service";
import type { SubscriptionTier } from "@/lib/types";

// Dodo Payments webhook — no user session, verified purely via signature.
// https://docs.dodopayments.com/developer-resources/webhooks

interface DodoEvent {
  business_id: string;
  type: string;
  timestamp: string;
  data: {
    payload_type: "Subscription" | "Payment";
    subscription_id?: string;
    payment_id?: string;
    customer?: { customer_id: string };
    metadata?: Record<string, string>;
    next_billing_date?: string;
    total_amount?: number;
    currency?: string;
  };
}

async function findInstitutionId(
  adminClient: ReturnType<typeof createAdminClient>,
  opts: { metadata?: Record<string, string>; customerId?: string; subscriptionId?: string }
): Promise<string | null> {
  if (opts.metadata?.institutionId) return opts.metadata.institutionId;

  if (opts.subscriptionId) {
    const { data } = await adminClient
      .from("institutions")
      .select("id")
      .eq("dodo_subscription_id", opts.subscriptionId)
      .maybeSingle();
    if (data) return (data as unknown as { id: string }).id;
  }
  if (opts.customerId) {
    const { data } = await adminClient
      .from("institutions")
      .select("id")
      .eq("dodo_customer_id", opts.customerId)
      .maybeSingle();
    if (data) return (data as unknown as { id: string }).id;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
  };

  const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!);
  try {
    await webhook.verify(payload, headers);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as DodoEvent;
  const adminClient = createAdminClient();

  switch (event.type) {
    case "subscription.active":
    case "subscription.renewed": {
      const { metadata, subscription_id, customer, next_billing_date } = event.data;
      const institutionId = await findInstitutionId(adminClient, {
        metadata,
        customerId: customer?.customer_id,
      });
      const tier = metadata?.tier as SubscriptionTier | undefined;
      if (!institutionId || !tier || !(tier in PLAN_LIMITS)) break;

      const limits = PLAN_LIMITS[tier as keyof typeof PLAN_LIMITS];
      await adminClient
        .from("institutions")
        .update({
          subscription_tier: tier,
          max_teachers: limits.maxTeachers,
          max_students: limits.maxStudents,
          ai_generations_limit: limits.aiCredits,
          billing_status: "active",
          dodo_subscription_id: subscription_id,
          current_period_end: next_billing_date ?? null,
        })
        .eq("id", institutionId);
      break;
    }

    case "subscription.cancelled":
    case "subscription.failed":
    case "subscription.expired": {
      const { subscription_id, customer } = event.data;
      const institutionId = await findInstitutionId(adminClient, {
        customerId: customer?.customer_id,
        subscriptionId: subscription_id,
      });
      if (!institutionId) break;

      const freeLimits = PLAN_LIMITS.free;
      await adminClient
        .from("institutions")
        .update({
          subscription_tier: "free",
          max_teachers: freeLimits.maxTeachers,
          max_students: freeLimits.maxStudents,
          ai_generations_limit: freeLimits.aiCredits,
          billing_status: event.type === "subscription.failed" ? "past_due" : "canceled",
          current_period_end: null,
        })
        .eq("id", institutionId);
      break;
    }

    case "payment.succeeded": {
      const { metadata, customer, subscription_id, total_amount, currency, payment_id } = event.data;
      const institutionId = await findInstitutionId(adminClient, {
        metadata,
        customerId: customer?.customer_id,
        subscriptionId: subscription_id,
      });
      if (!institutionId) break;

      const now = new Date().toISOString();
      await adminClient.from("invoices").insert({
        institution_id: institutionId,
        amount: (total_amount ?? 0) / 100,
        currency: currency ?? "INR",
        status: "paid",
        issued_at: now,
        due_at: now,
        paid_at: now,
        description: metadata?.tier
          ? `${metadata.tier} plan — ${metadata.billingCycle ?? ""}`.trim()
          : `Payment ${payment_id ?? ""}`.trim(),
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
