import * as anchor from "@coral-xyz/anchor";

const PAYMENTS_API = import.meta.env.VITE_PAYMENTS_API || "https://payments.magicblock.app";

export async function getAuthToken(wallet: anchor.Wallet): Promise<string> {
  const res = await fetch(
    `${PAYMENTS_API}/v1/spl/challenge?pubkey=${wallet.publicKey.toBase58()}&cluster=devnet`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Failed to get auth challenge");
  
  const challenge = data.challenge;
  const messageBytes = new TextEncoder().encode(challenge);
  const signature = await (wallet as any).signMessage(messageBytes);
  
  // Browser-safe base64 encoding (Vite doesn't polyfill Buffer)
  const signatureBase64 = btoa(String.fromCharCode.apply(null, signature as any));

  const loginRes = await fetch(`${PAYMENTS_API}/v1/spl/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pubkey: wallet.publicKey.toBase58(),
      challenge,
      signature: signatureBase64,
      cluster: "devnet"
    }),
  });
  
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error(loginData?.error?.message || "Failed to login");

  return loginData.token;
}
