use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

// Use the program ID from Anchor.toml [programs.localnet]
declare_id!("DBAv87orWGKYgTka13SJdzD4eozyd46wQMCzAjjHqZ5h");

#[ephemeral]
#[program]
pub mod ghost_book {
    use super::*;

    // ── Base layer ──────────────────────────────────────────────────────────
    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        base_mint: Pubkey,
        quote_mint: Pubkey,
    ) -> Result<()> {
        instructions::initialize::initialize_market(ctx, base_mint, quote_mint)
    }

    pub fn initialize_sponsor(ctx: Context<InitializeSponsor>) -> Result<()> {
        instructions::initialize::initialize_sponsor(ctx)
    }

    // ── Delegation (base layer) ─────────────────────────────────────────────
    pub fn delegate_sponsor(ctx: Context<DelegateSponsor>) -> Result<()> {
        instructions::delegate::delegate_sponsor(ctx)
    }

    // ── ER instructions (send to TEE RPC) ──────────────────────────────────
    pub fn place_order(
        ctx: Context<PlaceOrder>,
        side: crate::state::Side,
        price: u64,
        size: u64,
    ) -> Result<()> {
        instructions::place_order::place_order(ctx, side, price, size)
    }

    pub fn cancel_order(ctx: Context<CancelOrder>) -> Result<()> {
        instructions::cancel_order::cancel_order(ctx)
    }

    // ── Crank (ER, called by scheduler every 50 ms) ─────────────────────────
    pub fn initialize_crank(ctx: Context<InitializeCrank>) -> Result<()> {
        instructions::crank::initialize_crank(ctx)
    }

    pub fn crank_match(ctx: Context<CrankMatch>) -> Result<()> {
        instructions::crank::crank_match(ctx)
    }

    // ── Settlement (ER → base layer via Magic Action) ───────────────────────
    pub fn settle_match(
        ctx: Context<SettleMatch>,
        bid_timestamp: i64,
        ask_timestamp: i64,
    ) -> Result<()> {
        instructions::settle::settle_match(ctx, bid_timestamp, ask_timestamp)
    }

    /// Magic Action target — executed on Solana base layer after ER commit
    pub fn finalize_settlement(
        ctx: Context<FinalizeSettlement>,
        bid_owner: Pubkey,
        ask_owner: Pubkey,
        fill_price: u64,
        fill_size: u64,
    ) -> Result<()> {
        instructions::settle::finalize_settlement(
            ctx, bid_owner, ask_owner, fill_price, fill_size,
        )
    }

    // ── Undelegate (ER) ─────────────────────────────────────────────────────
    pub fn undelegate_sponsor(ctx: Context<UndelegateSponsor>) -> Result<()> {
        instructions::delegate::undelegate_sponsor(ctx)
    }
}
