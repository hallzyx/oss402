import { decodePaymentResponseHeader } from "@x402/core/http";

type SettleLike = {
  success?: boolean;
  transaction?: string;
};

/**
 * Reads the facilitator settlement transaction hash from x402 PAYMENT-RESPONSE headers.
 */
export function transactionHashFromPaymentResponseHeaders(
  getHeader: (name: string) => string | null | undefined,
): string | undefined {
  const encoded =
    getHeader("PAYMENT-RESPONSE") ?? getHeader("X-PAYMENT-RESPONSE");
  if (!encoded) {
    return undefined;
  }
  try {
    const decoded = decodePaymentResponseHeader(encoded) as SettleLike;
    if (decoded.transaction) {
      return decoded.transaction;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
