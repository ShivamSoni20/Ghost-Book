import * as anchor from "@coral-xyz/anchor";

const PAYMENTS_API = import.meta.env.VITE_PAYMENTS_API || "https://payments.magicblock.app";

export async function getAuthToken(wallet: anchor.Wallet): Promise<string> {
  const { challenge } = await fetch(
    `${PAYMENTS_API}/v1/spl/challenge?pubkey=${wallet.publicKey.toBase58()}`
  ).then(r => r.json());

  const messageBytes = new TextEncoder().encode(challenge);
  const signature = await (wallet as any).signMessage(messageBytes);
  const signatureBase64 = Buffer.from(signature).toString("base64");

  const { token } = await fetch(`${PAYMENTS_API}/v1/spl/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pubkey: wallet.publicKey.toBase58(),
      challenge,
      signature: signatureBase64,
    }),
  }).then(r => r.json());

  return token;
}
