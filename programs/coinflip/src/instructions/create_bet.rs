use anchor_lang::prelude::*;

use crate::constants::{BET_SEED, MARKET_SEED, MAX_BET_NAME_LEN};
use crate::error::MarketError;
use crate::state::{Bet, BetStatus, Market, Outcome};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateBet<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED],
        bump = market.bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = creator,
        space = 8 + Bet::INIT_SPACE,
        seeds = [BET_SEED, &market.next_bet_id.to_le_bytes()],
        bump
    )]
    pub bet: Account<'info, Bet>,

    pub system_program: Program<'info, System>,
}

pub fn create_bet_handler(ctx: Context<CreateBet>, name: String) -> Result<()> {
    let trimmed = name.trim();
    require!(
        !trimmed.is_empty() && trimmed.len() <= MAX_BET_NAME_LEN,
        MarketError::InvalidName
    );

    let market = &mut ctx.accounts.market;
    let bet_id = market.next_bet_id;
    market.next_bet_id = bet_id
        .checked_add(1)
        .ok_or(MarketError::MathOverflow)?;

    let clock = Clock::get()?;
    let bet = &mut ctx.accounts.bet;
    bet.bet_id = bet_id;
    bet.creator = ctx.accounts.creator.key();
    bet.name = trimmed.to_string();
    bet.created_ts = clock.unix_timestamp;
    bet.settled_ts = 0;
    bet.status = BetStatus::Open;
    bet.outcome = Outcome::Undecided;
    bet.bump = ctx.bumps.bet;

    msg!("Bet {} created: {}", bet_id, trimmed);
    Ok(())
}
