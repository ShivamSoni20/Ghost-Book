use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::{AccountMeta, Instruction},
    program::invoke_signed,
};
use ephemeral_rollups_sdk::consts::MAGIC_PROGRAM_ID;
use magicblock_magic_program_api::{args::ScheduleTaskArgs, instruction::MagicBlockInstruction};

pub const CRANK_INTERVAL_MS: u32 = 50;

pub fn initialize_crank(ctx: Context<InitializeCrank>) -> Result<()> {
    let crank_ix = Instruction {
        program_id: crate::ID,
        accounts: vec![],
        data: anchor_lang::InstructionData::data(&crate::instruction::CrankMatch {}),
    };

    let ix_data = bincode::serialize(&MagicBlockInstruction::ScheduleTask(ScheduleTaskArgs {
        task_id: 1,
        execution_interval_millis: CRANK_INTERVAL_MS as i64,
        iterations: 0,
        instructions: vec![crank_ix],
    })).map_err(|_| ProgramError::InvalidArgument)?;

    let schedule_ix = Instruction::new_with_bytes(
        MAGIC_PROGRAM_ID,
        &ix_data,
        vec![
            AccountMeta::new(ctx.accounts.payer.key(), true),
            AccountMeta::new(ctx.accounts.crank_state.key(), false),
        ],
    );

    invoke_signed(&schedule_ix, &[
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.crank_state.to_account_info(),
    ], &[])?;
    
    Ok(())
}

pub fn crank_match(_ctx: Context<CrankMatch>) -> Result<()> {
    // TEE matching engine logic will run here
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeCrank<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + 32, // dummy state
        seeds = [b"crank_state"],
        bump
    )]
    pub crank_state: AccountInfo<'info>, // Can be UncheckedAccount

    /// CHECK: MagicBlock Magic Program
    pub magic_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CrankMatch<'info> {
    /// CHECK: crank signer
    pub crank: UncheckedAccount<'info>,
}
