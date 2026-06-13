use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Order not matched — prices do not cross")]
    OrderNotMatched,
    #[msg("Unauthorized — you do not own this order")]
    Unauthorized,
    #[msg("Order already filled — cannot cancel")]
    OrderAlreadyFilled,
    #[msg("Price or size cannot be zero")]
    InvalidOrderParams,
    InsufficientSponsorLamports,
    SponsorNotDelegated,
}
