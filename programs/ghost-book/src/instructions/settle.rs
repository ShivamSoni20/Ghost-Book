use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::ephem::{
    CallHandler, MagicIntentBundleBuilder, FoldableIntentBuilder,
};
use magicblock_magic_program_api::args::{ActionArgs, ShortAccountMeta};

pub fn settle_match(ctx: Context<SettleMatch>, _bid_id: Pubkey, _ask_id: Pubkey) -> Result<()> {
    // In a real implementation we would deserialize order structs.
    let fill_price = 100;
    let fill_size = 100;

    // Build the post-commit action (runs on base layer after commit)
    let instruction_data =
        anchor_lang::InstructionData::data(&crate::instruction::FinalizeSettlement {
            bid_owner: ctx.accounts.bid_owner.key(),
            ask_owner: ctx.accounts.ask_owner.key(),
            fill_price,
            fill_size,
        });

    let action = CallHandler {
        destination_program: crate::ID,
        accounts: vec![
            ShortAccountMeta { pubkey: ctx.accounts.market.key(),           is_writable: true  },
            ShortAccountMeta { pubkey: ctx.accounts.bid_token_account.key(), is_writable: true  },
            ShortAccountMeta { pubkey: ctx.accounts.ask_token_account.key(), is_writable: true  },
            ShortAccountMeta { pubkey: ctx.accounts.quote_vault.key(),       is_writable: true  },
            ShortAccountMeta { pubkey: ctx.accounts.base_vault.key(),        is_writable: true  },
            ShortAccountMeta { pubkey: anchor_spl::token::ID,                is_writable: false },
        ],
        args: ActionArgs::new(instruction_data),
        escrow_authority: ctx.accounts.payer.to_account_info(),
        compute_units: 200_000,
    };

    // Commit matched order accounts + fire base-layer settlement atomically
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

// --- Magic Action target: runs on BASE LAYER after commit ---
pub fn finalize_settlement(_ctx: Context<FinalizeSettlement>, _bid_owner: Pubkey, _ask_owner: Pubkey, _fill_price: u64, _fill_size: u64) -> Result<()> {
    // Transfer base tokens from vault to buyer
    // Transfer quote tokens from vault to seller
    // Update market.total_volume and market.total_matches
    Ok(())
}

#[derive(Accounts)]
pub struct SettleMatch<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: 
    pub bid_owner: AccountInfo<'info>,
    /// CHECK: 
    pub ask_owner: AccountInfo<'info>,
    /// CHECK: 
    #[account(mut)]
    pub bid_order: AccountInfo<'info>,
    /// CHECK: 
    #[account(mut)]
    pub ask_order: AccountInfo<'info>,
    /// CHECK: 
    #[account(mut)]
    pub market: AccountInfo<'info>,
    /// CHECK: 
    #[account(mut)]
    pub bid_token_account: AccountInfo<'info>,
    /// CHECK: 
    #[account(mut)]
    pub ask_token_account: AccountInfo<'info>,
    /// CHECK: 
    #[account(mut)]
    pub quote_vault: AccountInfo<'info>,
    /// CHECK: 
    #[account(mut)]
    pub base_vault: AccountInfo<'info>,
    /// CHECK: 
    pub magic_context: AccountInfo<'info>,
    /// CHECK: 
    pub magic_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeSettlement<'info> {
    /// CHECK: Base layer settlement
    pub dummy: AccountInfo<'info>,
}
