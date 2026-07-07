import DodoPayments from 'dodopayments'
import type { SubscriptionTier } from '@/lib/types'

// Server-side only — never import this file from a Client Component.
// Lazily constructed (like createAdminClient() in lib/supabase/admin.ts) so a
// missing DODO_PAYMENTS_API_KEY doesn't blow up at module-import time.
let _dodo: DodoPayments | null = null

export function getDodo(): DodoPayments {
  if (!_dodo) {
    _dodo = new DodoPayments({
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode',
    })
  }
  return _dodo
}

export type BillingCycle = 'monthly' | 'annual'
export type PaidTier = Exclude<SubscriptionTier, 'free'>

// Product IDs are created in the Dodo dashboard (one per tier x billing cycle)
// and wired in here via env vars — never hardcoded.
const PRODUCT_ENV_VAR: Record<PaidTier, Record<BillingCycle, string | undefined>> = {
  starter: {
    monthly: process.env.DODO_PRICE_STARTER_MONTHLY,
    annual:  process.env.DODO_PRICE_STARTER_ANNUAL,
  },
  institution: {
    monthly: process.env.DODO_PRICE_INSTITUTION_MONTHLY,
    annual:  process.env.DODO_PRICE_INSTITUTION_ANNUAL,
  },
  campus: {
    monthly: process.env.DODO_PRICE_CAMPUS_MONTHLY,
    annual:  process.env.DODO_PRICE_CAMPUS_ANNUAL,
  },
}

export function getDodoProductId(tier: PaidTier, billingCycle: BillingCycle): string {
  const productId = PRODUCT_ENV_VAR[tier]?.[billingCycle]
  if (!productId) {
    throw new Error(
      `No Dodo product configured for ${tier}/${billingCycle}. Set the corresponding DODO_PRICE_* env var.`
    )
  }
  return productId
}

export function isPaidTier(tier: SubscriptionTier): tier is PaidTier {
  return tier === 'starter' || tier === 'institution' || tier === 'campus'
}
