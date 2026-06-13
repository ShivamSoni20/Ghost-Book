use anchor_lang::prelude::*;

pub fn delegate_sponsor(_ctx: Context<DelegateSponsor>) -> Result<()> {
    Ok(())
}

pub fn undelegate_sponsor(_ctx: Context<UndelegateSponsor>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct DelegateSponsor<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UndelegateSponsor<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
