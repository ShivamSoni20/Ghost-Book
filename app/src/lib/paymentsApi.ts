const API = import.meta.env.VITE_PAYMENTS_API || "https://payments.magicblock.app";

export async function buildDepositTx(params: {
  owner: string; mint: string; amount: number;
}) {
  return fetch(`${API}/v1/spl/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then(r => r.json());
}

export async function getPrivateBalance(
  owner: string, mint: string, token: string
): Promise<number> {
  return fetch(`${API}/v1/spl/private-balance?owner=${owner}&mint=${mint}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json()).then(d => d.balance);
}

export async function buildWithdrawTx(params: {
  owner: string; mint: string; amount: number; token: string;
}) {
  return fetch(`${API}/v1/spl/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${params.token}` },
    body: JSON.stringify(params),
  }).then(r => r.json());
}

export async function getSwapQuote(inputMint: string, outputMint: string, amount: number) {
  return fetch(`${API}/v1/swap/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`)
    .then(r => r.json());
}

export async function buildSwapTx(quoteResponse: any, token?: string) {
  return fetch(`${API}/v1/swap/swap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ quoteResponse }),
  }).then(r => r.json());
}
