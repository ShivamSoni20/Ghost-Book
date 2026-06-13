use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::cpi::crank_schedule;

pub const CRANK_INTERVAL_MS: u32 = 50;

pub fn initialize_crank(ctx: Context<InitializeCrank>) -> Result<()> {
    // Schedule this instruction to run every 50ms on the ER
    crank_schedule(
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.crank_state.to_account_info(),
        ctx.accounts.magic_program.to_account_info(),
        CRANK_INTERVAL_MS,
    )?;
    Ok(())
}

pub fn crank_match(ctx: Context<CrankMatch>) -> Result<()> {
    // Scan the top-of-book bid and ask ephemeral accounts
    // If bid.price >= ask.price -> call settle_match
    // If no cross -> do nothing (zero gas, zero public state)
    // Unmatched orders older than TTL -> close_ephemeral_order (refunds rent)
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeCrank<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: Crank state
    #[account(mut)]
    pub crank_state: AccountInfo<'info>,
    /// CHECK: Magic program
    pub magic_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CrankMatch<'info> {
    /// CHECK: crank
    pub crank: AccountInfo<'info>,
}
