use anchor_lang::prelude::*;

// --- Order (ephemeral account — lives only inside the PER TEE) ---
#[account]
pub struct Order {
    pub owner: Pubkey,          // wallet that placed this order
    pub side: Side,             // Bid or Ask
    pub price: u64,             // limit price in USDC lamports (6 decimals)
    pub size: u64,              // token amount in base token lamports
    pub filled: u64,            // amount already filled
    pub created_at: i64,        // unix timestamp
    pub bump: u8,
}

impl Order {
    pub const SPACE: usize = 8 + 32 + 1 + 8 + 8 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum Side { Bid, Ask }

// --- Sponsor PDA (delegated to ER — pays ephemeral rent) ---
#[account]
pub struct Sponsor {
    pub authority: Pubkey,
    pub order_count: u64,
    pub bump: u8,
}

impl Sponsor {
    pub const SPACE: usize = 8 + 32 + 8 + 1;
    pub const SEED: &'static [u8] = b"sponsor";
}

// --- Market state (base layer) ---
#[account]
pub struct Market {
    pub authority: Pubkey,
    pub base_mint: Pubkey,      // e.g. SOL/wSOL mint
    pub quote_mint: Pubkey,     // e.g. USDC mint
    pub total_volume: u64,
    pub total_matches: u64,
    pub bump: u8,
}

impl Market {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1;
    pub const SEED: &'static [u8] = b"market";
}
