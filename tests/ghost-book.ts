import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GhostBook } from "../target/types/ghost_book";

describe("ghost-book", () => {
  const provider = new anchor.AnchorProvider(
    new anchor.web3.Connection("https://api.devnet.solana.com", { commitment: "confirmed" }),
    anchor.Wallet.local(),
    {}
  );

  const providerEr = new anchor.AnchorProvider(
    new anchor.web3.Connection("https://devnet-tee.magicblock.app/", {
      wsEndpoint: "wss://devnet-tee.magicblock.app/",
      commitment: "confirmed"
    }),
    anchor.Wallet.local(),
    {}
  );

  anchor.setProvider(provider);
  // @ts-ignore
  const program = anchor.workspace.GhostBook as Program<GhostBook>;

  it("Is initialized!", async () => {
    // Add your test here.
    console.log("Program initialized.");
  });
});
