use anchor_lang::prelude::*;
use crate::state::{Market, Sponsor};

pub fn initialize_market(ctx: Context<InitializeMarket>, base_mint: Pubkey, quote_mint: Pubkey) -> Result<()> {
    let market = &mut ctx.accounts.market;
    market.authority = ctx.accounts.authority.key();
    market.base_mint = base_mint;
    market.quote_mint = quote_mint;
    market.total_volume = 0;
    market.total_matches = 0;
    market.bump = ctx.bumps.market;
    Ok(())
}

pub fn initialize_sponsor(ctx: Context<InitializeSponsor>) -> Result<()> {
    let sponsor = &mut ctx.accounts.sponsor;
    sponsor.authority = ctx.accounts.authority.key();
    sponsor.order_count = 0;
    sponsor.bump = ctx.bumps.sponsor;
    Ok(())
}

#[derive(Accounts)]
#[instruction(base_mint: Pubkey, quote_mint: Pubkey)]
pub struct InitializeMarket<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: authority that controls the market
    pub authority: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        space = Market::SPACE,
        seeds = [Market::SEED, base_mint.as_ref(), quote_mint.as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeSponsor<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: the wallet that will own this sponsor
    pub authority: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        space = Sponsor::SPACE,
        seeds = [Sponsor::SEED, authority.key().as_ref()],
        bump
    )]
    pub sponsor: Account<'info, Sponsor>,
    pub system_program: Program<'info, System>,
}
