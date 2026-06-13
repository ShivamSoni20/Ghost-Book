import * as anchor from "@coral-xyz/anchor";
import { ConnectionMagicRouter } from "@magicblock-labs/ephemeral-rollups-sdk";

export const baseConnection = new anchor.web3.Connection(
  import.meta.env.VITE_PROVIDER_ENDPOINT || "https://api.devnet.solana.com",
  { commitment: "confirmed" }
);

export const erConnection = new anchor.web3.Connection(
  import.meta.env.VITE_EPHEMERAL_ENDPOINT || "https://devnet-tee.magicblock.app/",
  { wsEndpoint: (import.meta.env.VITE_EPHEMERAL_ENDPOINT || "https://devnet-tee.magicblock.app/").replace("https", "wss"), commitment: "confirmed" }
);

export const routerConnection = new ConnectionMagicRouter(
  "https://devnet-router.magicblock.app/",
  { wsEndpoint: "wss://devnet-router.magicblock.app/" }
);
