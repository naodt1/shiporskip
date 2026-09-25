import { type NextRequest } from "next/server";
import { applyBoost, stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return new Response("Not configured", { status: 400 });

  let event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const campaignId = s.metadata?.campaignId;
    if (campaignId && s.payment_status === "paid") await applyBoost(campaignId);
  }
  return new Response("ok");
}
