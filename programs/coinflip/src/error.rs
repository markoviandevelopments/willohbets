use anchor_lang::prelude::*;

#[error_code]
pub enum MarketError {
    #[msg("Price must be between 1% and 99% (100-9900 bps)")]
    InvalidPrice,
    #[msg("Quantity must be at least 1")]
    InvalidQuantity,
    #[msg("Bet name is empty or too long")]
    InvalidName,
    #[msg("Bet is not open for trading")]
    BetNotOpen,
    #[msg("Bet already settled")]
    AlreadySettled,
    #[msg("Order is not open")]
    OrderNotOpen,
    #[msg("Cannot fill your own order")]
    CannotFillOwnOrder,
    #[msg("Fill quantity exceeds remaining")]
    InsufficientRemaining,
    #[msg("Nothing to claim")]
    NothingToClaim,
    #[msg("Position already claimed")]
    AlreadyClaimed,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Insufficient escrow")]
    InsufficientEscrow,
    #[msg("Invalid outcome for settlement")]
    InvalidOutcome,
}
