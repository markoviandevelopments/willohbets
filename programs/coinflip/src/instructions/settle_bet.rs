use anchor_lang::prelude::*;

use crate::constants::{BET_SEED, MARKET_SEED};
use crate::error::MarketError;
use crate::state::{Bet, BetStatus, Market, Outcome};

#[derive(Accounts)]
pub struct SettleBet<'info> {
    pub settler: Signer<'info>,

    #[account(seeds = [MARKET_SEED], bump = market.bump)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [BET_SEED, &bet.bet_id.to_le_bytes()],
        bump = bet.bump,
        constraint = bet.status == BetStatus::Open @ MarketError::AlreadySettled,
    )]
    pub bet: Account<'info, Bet>,
}

pub fn settle_bet_handler(ctx: Context<SettleBet>, outcome: Outcome) -> Result<()> {
    require!(
        matches!(outcome, Outcome::Yes | Outcome::No | Outcome::Void),
        MarketError::InvalidOutcome
    );

    let clock = Clock::get()?;
    let bet = &mut ctx.accounts.bet;
    bet.outcome = outcome;
    bet.status = BetStatus::Settled;
    bet.settled_ts = clock.unix_timestamp;

    msg!(
        "Bet {} settled outcome={:?} by {}",
        bet.bet_id,
        outcome,
        ctx.accounts.settler.key()
    );
    Ok(())
}
