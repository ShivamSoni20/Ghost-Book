use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Order not matched")]
    OrderNotMatched,
}
