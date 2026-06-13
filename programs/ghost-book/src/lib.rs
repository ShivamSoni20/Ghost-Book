use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("11111111111111111111111111111111");

#[ephemeral]
#[program]
pub mod ghost_book {
    use super::*;

    // --- Base layer ---
    pub fn initialize_market(ctx: Context<InitializeMarket>) -> Result<()> { 
        instructions::initialize::initialize_market(ctx)
    }
    pub fn initialize_sponsor(ctx: Context<InitializeSponsor>) -> Result<()> { 
        instructions::initialize::initialize_sponsor(ctx)
    }

    // --- Delegation (base layer) ---
    pub fn delegate_sponsor(ctx: Context<DelegateSponsor>) -> Result<()> { 
        instructions::delegate::delegate_sponsor(ctx)
    }

    // --- ER instructions (sent to TEE RPC) ---
    pub fn place_order(ctx: Context<PlaceOrder>, side: crate::state::Side, price: u64, size: u64) -> Result<()> { 
        instructions::place_order::place_order(ctx, side, price, size)
    }
    pub fn cancel_order(ctx: Context<CancelOrder>) -> Result<()> { 
        instructions::cancel_order::cancel_order(ctx)
    }

    // --- Crank matching loop (ER, called every 50ms by scheduler) ---
    pub fn crank_match(ctx: Context<CrankMatch>) -> Result<()> { 
        instructions::crank::crank_match(ctx)
    }

    // --- Commit + Magic Action (ER -> base layer) ---
    pub fn settle_match(ctx: Context<SettleMatch>, bid_id: Pubkey, ask_id: Pubkey) -> Result<()> { 
        instructions::settle::settle_match(ctx, bid_id, ask_id)
    }

    // --- Magic Action target (base layer, invoked automatically by Magic Action) ---
    pub fn finalize_settlement(ctx: Context<FinalizeSettlement>, bid_owner: Pubkey, ask_owner: Pubkey, fill_price: u64, fill_size: u64) -> Result<()> { 
        instructions::settle::finalize_settlement(ctx, bid_owner, ask_owner, fill_price, fill_size)
    }

    // --- Undelegate (ER) ---
    pub fn undelegate_sponsor(ctx: Context<UndelegateSponsor>) -> Result<()> { 
        instructions::delegate::undelegate_sponsor(ctx)
    }
}
