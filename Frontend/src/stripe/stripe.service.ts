
import api from "@/lib/api";

export type CheckoutResponse = {
  url: string;
};

export type PortalResponse = {
  url: string;
};

// ==========================================
// Stripe Checkout
// FREE -> STARTER
// ==========================================

export async function createCheckout(
  plan: string
): Promise<CheckoutResponse> {
  const response = await api.post<CheckoutResponse>(
    "/stripe/create-checkout",
    {
      plan,
    }
  );

  return response.data;
}

// ==========================================
// Stripe Customer Portal
// STARTER / PREMIUM
// ==========================================

export async function createPortalSession(): Promise<PortalResponse> {
  const response = await api.post<PortalResponse>(
    "/stripe/create-portal-session"
  );

  return response.data;
}

