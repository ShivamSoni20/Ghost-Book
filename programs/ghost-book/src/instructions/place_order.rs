use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral_accounts;
use crate::state::{Order, Side, Sponsor};
use crate::errors::ErrorCode;

pub fn place_order(
    ctx: Context<PlaceOrder>,
    side: Side,
    price: u64,
    size: u64,
) -> Result<()> {
    require!(price > 0 && size > 0, ErrorCode::InvalidOrderParams);

    // Create ephemeral account for this order — lives only inside TEE, invisible on mainnet
    ctx.accounts.create_ephemeral_order(Order::SPACE as u32)?;

    let mut data = ctx.accounts.order.try_borrow_mut_data()?;
    let order = Order {
        owner: ctx.accounts.trader.key(),
        side,
        price,
        size,
        filled: 0,
        created_at: Clock::get()?.unix_timestamp,
        bump: ctx.bumps.order,
    };
    order.try_serialize(&mut &mut data[..])?;

    let sponsor = &mut ctx.accounts.sponsor;
    sponsor.order_count += 1;

    Ok(())
}

#[ephemeral_accounts]
#[derive(Accounts)]
#[instruction(side: Side, price: u64, size: u64)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,

    #[account(
        mut,
        sponsor,                                   // pays ephemeral rent
        seeds = [Sponsor::SEED, trader.key().as_ref()],
        bump = sponsor.bump,
        has_one = authority
    )]
    pub sponsor: Account<'info, Sponsor>,

    /// CHECK: trader is the authority
    pub authority: UncheckedAccount<'info>,

    /// CHECK: Random pubkey provided by client to salt the PDA
    pub order_id: UncheckedAccount<'info>,

    /// CHECK: ephemeral PDA — one per order, born and dies inside TEE
    #[account(
        mut,
        eph,
        seeds = [b"order", trader.key().as_ref(), order_id.key().as_ref()],
        bump
    )]
    pub order: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    // vault and magic_program auto-injected by macro
}
