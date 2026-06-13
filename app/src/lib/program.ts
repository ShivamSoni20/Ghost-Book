import * as anchor from "@coral-xyz/anchor";
import { baseConnection, erConnection } from "./connections";

const PROGRAM_ID = new anchor.web3.PublicKey("GhBk11111111111111111111111111111111111111");
const IDL: any = {};

export function getBaseProgram(wallet: anchor.Wallet) {
  const provider = new anchor.AnchorProvider(baseConnection, wallet, { commitment: "confirmed" });
  return new anchor.Program<any>(IDL, PROGRAM_ID, provider);
}

export function getErProgram(wallet: anchor.Wallet) {
  const provider = new anchor.AnchorProvider(erConnection, wallet, { commitment: "confirmed" });
  return new anchor.Program<any>(IDL, PROGRAM_ID, provider);
}

export function getSponsorPda(trader: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sponsor"), trader.toBuffer()], PROGRAM_ID
  );
}

export function getOrderPda(trader: anchor.web3.PublicKey, timestamp: number) {
  // Fix byte array for 64-bit int
  const buf = Buffer.alloc(8);
  buf.writeBigInt64LE(BigInt(timestamp));
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("order"), trader.toBuffer(), buf],
    PROGRAM_ID
  );
}
