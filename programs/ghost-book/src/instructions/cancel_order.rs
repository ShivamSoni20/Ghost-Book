use anchor_lang::prelude::*;

pub fn cancel_order(_ctx: Context<CancelOrder>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct CancelOrder<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
