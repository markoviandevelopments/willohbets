use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{
    BET_SEED, CONTRACT_LAMPORTS, MARKET_SEED, POSITION_SEED, VAULT_SEED,
};
use crate::error::MarketError;
use crate::state::{Bet, BetStatus, Market, Outcome, Position};

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(seeds = [MARKET_SEED], bump = market.bump)]
    pub market: Account<'info, Market>,

    #[account(
        seeds = [BET_SEED, &position.bet_id.to_le_bytes()],
        bump = bet.bump,
        constraint = bet.status == BetStatus::Settled @ MarketError::BetNotOpen,
    )]
    pub bet: Account<'info, Bet>,

    #[account(
        mut,
        seeds = [POSITION_SEED, &position.bet_id.to_le_bytes(), owner.key().as_ref()],
        bump = position.bump,
        has_one = owner,
        constraint = !position.claimed @ MarketError::AlreadyClaimed,
    )]
    pub position: Account<'info, Position>,

    /// CHECK: vault
    #[account(mut, seeds = [VAULT_SEED], bump = market.vault_bump)]
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn claim_handler(ctx: Context<Claim>) -> Result<()> {
    let outcome = ctx.accounts.bet.outcome;
    let yes = ctx.accounts.position.yes_contracts;
    let no = ctx.accounts.position.no_contracts;
    let bet_id = ctx.accounts.position.bet_id;

    let payout = match outcome {
        Outcome::Yes => yes
            .checked_mul(CONTRACT_LAMPORTS)
            .ok_or(MarketError::MathOverflow)?,
        Outcome::No => no
            .checked_mul(CONTRACT_LAMPORTS)
            .ok_or(MarketError::MathOverflow)?,
        Outcome::Void => {
            // Refund half contract value per side held (matched pairs get full stake back)
            let y = yes
                .checked_mul(CONTRACT_LAMPORTS / 2)
                .ok_or(MarketError::MathOverflow)?;
            let n = no
                .checked_mul(CONTRACT_LAMPORTS / 2)
                .ok_or(MarketError::MathOverflow)?;
            y.checked_add(n).ok_or(MarketError::MathOverflow)?
        }
        Outcome::Undecided => return err!(MarketError::BetNotOpen),
    };

    require!(payout > 0, MarketError::NothingToClaim);

    let bump = ctx.accounts.market.vault_bump;
    let seeds: &[&[u8]] = &[VAULT_SEED, &[bump]];
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.owner.to_account_info(),
            },
            &[seeds],
        ),
        payout,
    )?;

    ctx.accounts.position.claimed = true;
    msg!("Claimed {} lamports for bet {}", payout, bet_id);
    Ok(())
}
