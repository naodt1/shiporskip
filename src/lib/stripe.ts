import "server-only";
import Stripe from "stripe";
import { appUrl, BOOST_HOURS, BOOST_PRICE_CENTS } from "./config";
import { db } from "./db";

export const stripeEnabled = () => !!process.env.STRIPE_SECRET_KEY;

let client: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export async function applyBoost(campaignId: string) {
  await db.campaign.update({
    where: { id: campaignId },
    data: { boostedUntil: new Date(Date.now() + BOOST_HOURS * 3_600_000) },
  });
}

/** Stripe Checkout URL for boosting a campaign. The webhook applies the boost. */
export async function boostCheckoutUrl(campaignId: string, userId: string) {
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: BOOST_PRICE_CENTS,
          product_data: { name: `ShipOrSkip Boost · pinned ${BOOST_HOURS}h` },
        },
      },
    ],
    metadata: { campaignId, userId },
    success_url: `${appUrl()}/me?c=${campaignId}&boosted=1`,
    cancel_url: `${appUrl()}/me?c=${campaignId}`,
  });
  return session.url!;
}
