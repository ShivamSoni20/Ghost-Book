use anchor_lang::prelude::*;

use ephemeral_rollups_sdk::cpi::{DelegateConfig, delegate_account, DelegateAccounts};
use crate::state::Sponsor;

/// TEE validator pubkey on devnet
pub const TEE_VALIDATOR: &str = "MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo";

pub fn delegate_sponsor(ctx: Context<DelegateSponsor>) -> Result<()> {
    let tee_validator = TEE_VALIDATOR
        .parse::<Pubkey>()
        .map_err(|_| crate::errors::ErrorCode::OrderNotMatched)?;

    let accounts = DelegateAccounts {
        payer: &ctx.accounts.payer.to_account_info(),
        pda: &ctx.accounts.sponsor.to_account_info(),
        owner_program: &ctx.accounts.owner_program.to_account_info(),
        buffer: &ctx.accounts.buffer.to_account_info(),
        delegation_record: &ctx.accounts.delegation_record.to_account_info(),
        delegation_metadata: &ctx.accounts.delegation_metadata.to_account_info(),
        delegation_program: &ctx.accounts.delegation_program.to_account_info(),
        system_program: &ctx.accounts.system_program.to_account_info(),
    };

    delegate_account(
        accounts,
        &[
            Sponsor::SEED,
            ctx.accounts.payer.key().as_ref(),
            &[ctx.accounts.sponsor.bump],
        ],
        DelegateConfig {
            commit_frequency_ms: 10_000,
            validator: Some(tee_validator),
        },
    )?;
    Ok(())
}

pub fn undelegate_sponsor(_ctx: Context<UndelegateSponsor>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct DelegateSponsor<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [Sponsor::SEED, payer.key().as_ref()],
        bump  = sponsor.bump
    )]
    pub sponsor: Account<'info, Sponsor>,

    pub system_program: Program<'info, System>,

    /// CHECK: injected
    #[account(mut)]
    pub buffer: UncheckedAccount<'info>,
    /// CHECK: injected
    #[account(mut)]
    pub delegation_record: UncheckedAccount<'info>,
    /// CHECK: injected
    #[account(mut)]
    pub delegation_metadata: UncheckedAccount<'info>,
    /// CHECK: injected
    pub owner_program: UncheckedAccount<'info>,
    /// CHECK: injected
    pub delegation_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct UndelegateSponsor<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
