use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral_accounts;
use crate::state::{Order, Side, Sponsor};

pub fn place_order(ctx: Context<PlaceOrder>, side: Side, price: u64, size: u64) -> Result<()> {
    let order = &mut ctx.accounts.order;
    order.owner = ctx.accounts.trader.key();
    order.side = side;
    order.price = price;
    order.size = size;
    order.filled = 0;
    order.created_at = Clock::get()?.unix_timestamp;
    order.bump = ctx.bumps.order;

    let sponsor = &mut ctx.accounts.sponsor;
    sponsor.order_count += 1;

    Ok(())
}

#[derive(Accounts)]
#[instruction(side: Side, price: u64, size: u64)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,

    #[account(
        mut,
        seeds = [Sponsor::SEED, trader.key().as_ref()],
        bump = sponsor.bump,
        has_one = authority
    )]
    pub sponsor: Account<'info, Sponsor>,

    /// CHECK: trader is the authority
    pub authority: AccountInfo<'info>,

    #[account(
        init,
        payer = trader,
        space = Order::SPACE,
        seeds = [b"order", trader.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub order: Account<'info, Order>,

    pub system_program: Program<'info, System>,
}
