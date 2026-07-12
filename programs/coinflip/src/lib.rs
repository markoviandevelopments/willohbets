pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("BPpvi9mmM8yzVbGofQARnsDjxdvVXioEbE5UB2F24uJb");

#[program]
pub mod coinflip {
    use super::*;

    pub fn initialize_market(ctx: Context<InitializeMarket>) -> Result<()> {
        initialize_market_handler(ctx)
    }

    /// Moderator creates a named bet (YES vs NO market).
    pub fn create_bet(ctx: Context<CreateBet>, name: String) -> Result<()> {
        create_bet_handler(ctx, name)
    }

    pub fn place_order(
        ctx: Context<PlaceOrder>,
        bet_id: u64,
        side: Side,
        price_bps: u64,
        quantity: u64,
    ) -> Result<()> {
        place_order_handler(ctx, bet_id, side, price_bps, quantity)
    }

    pub fn fill_order(ctx: Context<FillOrder>, fill_qty: u64) -> Result<()> {
        fill_order_handler(ctx, fill_qty)
    }

    pub fn cancel_order(ctx: Context<CancelOrder>) -> Result<()> {
        cancel_order_handler(ctx)
    }

    /// Moderator resolves a bet: Yes, No, or Void.
    pub fn settle_bet(ctx: Context<SettleBet>, outcome: Outcome) -> Result<()> {
        settle_bet_handler(ctx, outcome)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        claim_handler(ctx)
    }
}
