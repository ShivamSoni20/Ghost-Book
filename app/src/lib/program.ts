import * as anchor from "@coral-xyz/anchor";
import { baseConnection, erConnection } from "./connections";

// Generated after anchor build — import the IDL
import IDL from "../../../target/idl/ghost_book.json";
import type { GhostBook } from "../../../target/types/ghost_book";

const PROGRAM_ID = new anchor.web3.PublicKey(
  "DBAv87orWGKYgTka13SJdzD4eozyd46wQMCzAjjHqZ5h"
);

export function getBaseProgram(wallet: anchor.Wallet) {
  const provider = new anchor.AnchorProvider(baseConnection, wallet, {
    commitment: "confirmed",
  });
  return new anchor.Program<GhostBook>(IDL as any, PROGRAM_ID, provider);
}

export function getErProgram(wallet: anchor.Wallet) {
  const provider = new anchor.AnchorProvider(erConnection, wallet, {
    commitment: "confirmed",
  });
  return new anchor.Program<GhostBook>(IDL as any, PROGRAM_ID, provider);
}

export function getSponsorPda(trader: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sponsor"), trader.toBuffer()],
    PROGRAM_ID
  );
}

// timestamp must match the i64 passed to place_order on the ER
export function getOrderPda(
  trader: anchor.web3.PublicKey,
  timestamp: number
) {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64LE(BigInt(timestamp));
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("order"), trader.toBuffer(), buf],
    PROGRAM_ID
  );
}
