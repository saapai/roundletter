import * as crypto from "crypto";

// Direct Kalshi REST API client for live portfolio balance.
// Uses RSA-PSS signature auth. Env vars:
//   KALSHI_API_KEY_ID          — API key ID
//   KALSHI_RSA_PRIVATE_KEY     — PEM-encoded RSA private key

const KALSHI_API_BASE = "https://api.elections.kalshi.com/trade-api/v2";

function signRequest(
  privateKeyPem: string,
  timestampMs: string,
  method: string,
  fullPath: string,
): string {
  const privateKey = crypto.createPrivateKey({ key: privateKeyPem, format: "pem" });
  const message = `${timestampMs}${method}${fullPath}`;
  const signature = crypto.sign("sha256", Buffer.from(message), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32,
  });
  return signature.toString("base64");
}

async function kalshiGet<T>(path: string): Promise<T | null> {
  const apiKeyId = process.env.KALSHI_API_KEY_ID;
  const rawPem = process.env.KALSHI_RSA_PRIVATE_KEY;
  if (!apiKeyId || !rawPem) return null;

  const privateKeyPem = rawPem.replace(/\\n/g, "\n");
  const method = "GET";
  const fullPath = `/trade-api/v2${path}`;
  const timestampMs = String(Date.now());
  const signature = signRequest(privateKeyPem, timestampMs, method, fullPath);

  try {
    const r = await fetch(`${KALSHI_API_BASE}${path}`, {
      method,
      headers: {
        "KALSHI-ACCESS-KEY": apiKeyId,
        "KALSHI-ACCESS-SIGNATURE": signature,
        "KALSHI-ACCESS-TIMESTAMP": timestampMs,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // cache 5 min
    });
    if (!r.ok) {
      console.warn(`[kalshi-api] ${path} → ${r.status}`);
      return null;
    }
    return (await r.json()) as T;
  } catch (e) {
    console.warn("[kalshi-api] fetch error:", (e as Error).message);
    return null;
  }
}

export type KalshiBalance = {
  cash_dollars: number;
  portfolio_value_dollars: number;
  total_dollars: number;
};

export async function getKalshiBalance(): Promise<KalshiBalance | null> {
  const data = await kalshiGet<{ balance?: number; portfolio_value?: number }>(
    "/portfolio/balance",
  );
  if (!data) return null;
  const cash = (data.balance ?? 0) / 100;
  const portfolio = (data.portfolio_value ?? 0) / 100;
  return {
    cash_dollars: cash,
    portfolio_value_dollars: portfolio,
    total_dollars: cash + portfolio,
  };
}
