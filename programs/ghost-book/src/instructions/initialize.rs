use anchor_lang::prelude::*;

pub fn initialize_market(_ctx: Context<InitializeMarket>) -> Result<()> {
    Ok(())
}

pub fn initialize_sponsor(_ctx: Context<InitializeSponsor>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeSponsor<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
