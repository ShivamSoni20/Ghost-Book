use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::ephem::{
    CallHandler, MagicIntentBundleBuilder, FoldableIntentBuilder
};
use ephemeral_rollups_sdk::{ActionArgs, ShortAccountMeta};

pub fn settle_match(
    ctx: Context<SettleMatch>,
    _bid_timestamp: i64,
    _ask_timestamp: i64,
) -> Result<()> {
    // Derive fill values from the delegated order accounts
    // (In production: deserialize both order accounts and compute the fill)
    let fill_price: u64 = 100_000_000; // placeholder — 100 USDC in micro-units
    let fill_size:  u64 = 1_000_000_000; // placeholder — 1 SOL in lamports

    // Encode the Magic Action instruction data for finalize_settlement
    let ix_data = anchor_lang::InstructionData::data(
        &crate::instruction::FinalizeSettlement {
            bid_owner:  ctx.accounts.bid_owner.key(),
            ask_owner:  ctx.accounts.ask_owner.key(),
            fill_price,
            fill_size,
        },
    );

    let action = CallHandler {
        destination_program: crate::ID,
        accounts: vec![
            ShortAccountMeta { pubkey: ctx.accounts.market.key(),            is_writable: true  },
            ShortAccountMeta { pubkey: ctx.accounts.bid_token_account.key(), is_writable: true  },
            ShortAccountMeta { pubkey: ctx.accounts.ask_token_account.key(), is_writable: true  },
            ShortAccountMeta { pubkey: ctx.accounts.quote_vault.key(),       is_writable: true  },
            ShortAccountMeta { pubkey: ctx.accounts.base_vault.key(),        is_writable: true  },
            ShortAccountMeta { pubkey: anchor_spl::token::ID,                is_writable: false },
        ],
        args: ActionArgs::new(ix_data),
        escrow_authority: ctx.accounts.payer.to_account_info(),
        compute_units: 200_000,
    };

    // Commit matched order accounts to mainnet + fire settlement Magic Action atomically
    MagicIntentBundleBuilder::new(
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.magic_context.to_account_info(),
        ctx.accounts.magic_program.to_account_info(),
    )
    .commit(&[
        ctx.accounts.bid_order.to_account_info(),
        ctx.accounts.ask_order.to_account_info(),
    ])
    .add_post_commit_actions([action])
    .build_and_invoke()?;

    Ok(())
}

/// Magic Action target — runs on Solana base layer after the ER commit is sealed
pub fn finalize_settlement(
    _ctx: Context<FinalizeSettlementAccounts>,
    _bid_owner:  Pubkey,
    _ask_owner:  Pubkey,
    _fill_price: u64,
    _fill_size:  u64,
) -> Result<()> {
    // TODO: transfer SPL tokens between bid/ask vaults using anchor_spl::token::transfer
    // TODO: update market.total_volume and market.total_matches
    Ok(())
}

#[derive(Accounts)]
pub struct SettleMatch<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: bid order owner
    pub bid_owner: UncheckedAccount<'info>,
    /// CHECK: ask order owner
    pub ask_owner: UncheckedAccount<'info>,

    /// CHECK: bid order ephemeral account
    #[account(mut)]
    pub bid_order: UncheckedAccount<'info>,
    /// CHECK: ask order ephemeral account
    #[account(mut)]
    pub ask_order: UncheckedAccount<'info>,

    /// CHECK: market state account
    #[account(mut)]
    pub market: UncheckedAccount<'info>,

    /// CHECK: buyer's token account
    #[account(mut)]
    pub bid_token_account: UncheckedAccount<'info>,
    /// CHECK: seller's token account
    #[account(mut)]
    pub ask_token_account: UncheckedAccount<'info>,

    /// CHECK: quote (USDC) vault
    #[account(mut)]
    pub quote_vault: UncheckedAccount<'info>,
    /// CHECK: base (SOL/wSOL) vault
    #[account(mut)]
    pub base_vault: UncheckedAccount<'info>,

    /// CHECK: MagicBlock magic context
    pub magic_context: UncheckedAccount<'info>,
    /// CHECK: MagicBlock magic program
    pub magic_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeSettlementAccounts<'info> {
    /// CHECK: placeholder — replace with real SPL token accounts when implementing
    pub dummy: UncheckedAccount<'info>,
}
