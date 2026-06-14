const API = import.meta.env.VITE_PAYMENTS_API || "https://payments.magicblock.app";
const CLUSTER = "devnet";

// Deposit: base layer → ephemeral rollup
// Amount must be in BASE UNITS (1 USDC = 1_000_000 with 6 decimals)
export async function buildDepositTx(params: {
  owner: string; mint: string; amount: number;
}) {
  const res = await fetch(`${API}/v1/spl/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner: params.owner,
      mint: params.mint,
      amount: params.amount, // caller must pass base units
      cluster: CLUSTER,
      initIfMissing: true,
      initVaultIfMissing: true,
      initAtasIfMissing: true,
      idempotent: true,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Deposit API error ${res.status}`);
  }
  return data;
}

// Private balance: requires bearer token
// API uses "address" not "owner" as query param
export async function getPrivateBalance(
  address: string, mint: string, token: string
): Promise<string> {
  const res = await fetch(
    `${API}/v1/spl/private-balance?address=${address}&mint=${mint}&cluster=${CLUSTER}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Balance API error ${res.status}`);
  }
  return data.balance; // base-unit string
}

// Base chain balance (no auth needed)
export async function getBaseBalance(
  address: string, mint: string
): Promise<string> {
  const res = await fetch(
    `${API}/v1/spl/balance?address=${address}&mint=${mint}&cluster=${CLUSTER}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Balance API error ${res.status}`);
  }
  return data.balance; // base-unit string
}

// Withdraw: ephemeral rollup → base layer
export async function buildWithdrawTx(params: {
  owner: string; mint: string; amount: number; token: string;
}) {
  const res = await fetch(`${API}/v1/spl/withdraw`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({
      owner: params.owner,
      mint: params.mint,
      amount: params.amount, // base units
      cluster: CLUSTER,
      initIfMissing: true,
      initAtasIfMissing: true,
      idempotent: true,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Withdraw API error ${res.status}`);
  }
  return data;
}

// Swap quote
export async function getSwapQuote(inputMint: string, outputMint: string, amount: number) {
  const res = await fetch(
    `${API}/v1/swap/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`
  );
  return res.json();
}

// Swap execution
export async function buildSwapTx(quoteResponse: any, userPublicKey: string) {
  const res = await fetch(`${API}/v1/swap/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userPublicKey, quoteResponse }),
  });
  return res.json();
}
