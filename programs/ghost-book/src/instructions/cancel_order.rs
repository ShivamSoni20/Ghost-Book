use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral_accounts;
use crate::state::{Order, Sponsor};
use crate::errors::ErrorCode;

pub fn cancel_order(ctx: Context<CancelOrder>) -> Result<()> {
    // Verify ownership and that the order is unfilled
    let order_data = Order::try_deserialize(&mut &ctx.accounts.order.data.borrow()[..])?;
    require!(
        order_data.owner == ctx.accounts.trader.key(),
        ErrorCode::Unauthorized
    );
    require!(
        order_data.filled == 0,
        ErrorCode::OrderAlreadyFilled
    );

    // Close the order account and return lamports to the trader
    let dest_lamports = ctx.accounts.trader.lamports();
    **ctx.accounts.trader.lamports.borrow_mut() = dest_lamports
        .checked_add(ctx.accounts.order.lamports())
        .unwrap();
    **ctx.accounts.order.lamports.borrow_mut() = 0;

    let mut data = ctx.accounts.order.try_borrow_mut_data()?;
    data.fill(0);

    ctx.accounts.sponsor.order_count =
        ctx.accounts.sponsor.order_count.saturating_sub(1);

    Ok(())
}

#[ephemeral_accounts]
#[derive(Accounts)]
pub struct CancelOrder<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,

    #[account(
        mut,
        sponsor,
        seeds = [Sponsor::SEED, trader.key().as_ref()],
        bump = sponsor.bump,
        has_one = authority
    )]
    pub sponsor: Account<'info, Sponsor>,

    /// CHECK: trader is the authority
    pub authority: UncheckedAccount<'info>,

    /// CHECK: The order_id used to create the order
    pub order_id: UncheckedAccount<'info>,

    /// CHECK: ephemeral order PDA
    #[account(
        mut,
        eph,
        seeds  = [b"order", trader.key().as_ref(), order_id.key().as_ref()],
        bump,
    )]
    pub order: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    // vault and magic_program auto-injected by macro
}
