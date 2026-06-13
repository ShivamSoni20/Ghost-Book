import * as anchor from "@coral-xyz/anchor";
import { Program }  from "@coral-xyz/anchor";
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
      commitment: "confirmed",
    }),
    anchor.Wallet.local(),
    {}
  );

  anchor.setProvider(provider);
  const program   = anchor.workspace.GhostBook as Program<GhostBook>;
  const programEr = new anchor.Program(program.idl, program.programId, providerEr);

  const trader    = anchor.Wallet.local().payer;
  const USDC_MINT = new anchor.web3.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  const SOL_MINT  = new anchor.web3.PublicKey("So11111111111111111111111111111111111111112");

  // Derive PDAs
  const [sponsorPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sponsor"), trader.publicKey.toBuffer()],
    program.programId
  );
  const [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("market"), SOL_MINT.toBuffer(), USDC_MINT.toBuffer()],
    program.programId
  );

  it("1. initialize_market", async () => {
    await program.methods
      .initializeMarket(SOL_MINT, USDC_MINT)
      .accounts({ payer: trader.publicKey, authority: trader.publicKey, market: marketPda, systemProgram: anchor.web3.SystemProgram.programId })
      .signers([trader])
      .rpc();
    const market = await program.account.market.fetch(marketPda);
    console.log("Market:", market.authority.toBase58());
  });

  it("2. initialize_sponsor", async () => {
    await program.methods
      .initializeSponsor()
      .accounts({ payer: trader.publicKey, authority: trader.publicKey, sponsor: sponsorPda, systemProgram: anchor.web3.SystemProgram.programId })
      .signers([trader])
      .rpc();
    const sponsor = await program.account.sponsor.fetch(sponsorPda);
    console.log("Sponsor order_count:", sponsor.orderCount.toString());
  });

  it("3. place_order (bid) on ER", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const tsBuf = Buffer.alloc(8);
    tsBuf.writeBigInt64LE(BigInt(timestamp));
    const [orderPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("order"), trader.publicKey.toBuffer(), tsBuf],
      program.programId
    );

    await programEr.methods
      .placeOrder(
        { bid: {} },
        new anchor.BN(140_000_000),  // $140.00 USDC
        new anchor.BN(1_000_000_000), // 1 SOL
        new anchor.BN(timestamp)
      )
      .accounts({
        trader: trader.publicKey,
        sponsor: sponsorPda,
        authority: trader.publicKey,
        order: orderPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([trader])
      .rpc({ skipPreflight: true });

    const order = await programEr.account.order.fetch(orderPda);
    console.log("Order price:", order.price.toString(), "side:", JSON.stringify(order.side));
  });

  it("4. cancel_order on ER", async () => {
    // Uses the timestamp from test 3 — in practice store it
    const timestamp = Math.floor(Date.now() / 1000) - 5;
    const tsBuf = Buffer.alloc(8);
    tsBuf.writeBigInt64LE(BigInt(timestamp));
    const [orderPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("order"), trader.publicKey.toBuffer(), tsBuf],
      program.programId
    );

    await programEr.methods
      .cancelOrder(new anchor.BN(timestamp))
      .accounts({
        trader: trader.publicKey,
        sponsor: sponsorPda,
        authority: trader.publicKey,
        order: orderPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([trader])
      .rpc({ skipPreflight: true });

    console.log("Order cancelled — no trace on mainnet");
  });
});
