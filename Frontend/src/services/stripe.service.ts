import api from "@/lib/api";

interface CheckoutResponse {
  url: string;
}

interface PortalResponse {
  url: string;
}

export async function createCheckout(
  plan: string
): Promise<CheckoutResponse> {
  const response =
    await api.post<CheckoutResponse>(
      "/stripe/create-checkout",
      {
        plan,
      }
    );

  return response.data;
}

// ==========================================
// Stripe Customer Portal
// ==========================================

export async function createPortalSession(): Promise<PortalResponse> {
  const response =
    await api.post<PortalResponse>(
      "/stripe/create-portal-session"
    );

  return response.data;
}