use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{
    BET_SEED, CONTRACT_LAMPORTS, MARKET_SEED, ORDER_SEED, POSITION_SEED, PRICE_BPS_SCALE,
    VAULT_SEED,
};
use crate::error::MarketError;
use crate::state::{
    Bet, BetStatus, Market, Order, OrderStatus, Position, Side,
};

#[derive(Accounts)]
pub struct FillOrder<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,

    /// CHECK: order owner
    #[account(address = order.owner)]
    pub maker: UncheckedAccount<'info>,

    #[account(seeds = [MARKET_SEED], bump = market.bump)]
    pub market: Account<'info, Market>,

    #[account(
        seeds = [BET_SEED, &order.bet_id.to_le_bytes()],
        bump = bet.bump,
        constraint = bet.status == BetStatus::Open @ MarketError::BetNotOpen,
    )]
    pub bet: Account<'info, Bet>,

    #[account(
        mut,
        seeds = [ORDER_SEED, &order.bet_id.to_le_bytes(), &order.order_id.to_le_bytes()],
        bump = order.bump,
        constraint = order.status == OrderStatus::Open @ MarketError::OrderNotOpen,
        constraint = order.owner != taker.key() @ MarketError::CannotFillOwnOrder,
    )]
    pub order: Account<'info, Order>,

    #[account(
        init_if_needed,
        payer = taker,
        space = 8 + Position::INIT_SPACE,
        seeds = [POSITION_SEED, &order.bet_id.to_le_bytes(), maker.key().as_ref()],
        bump
    )]
    pub maker_position: Account<'info, Position>,

    #[account(
        init_if_needed,
        payer = taker,
        space = 8 + Position::INIT_SPACE,
        seeds = [POSITION_SEED, &order.bet_id.to_le_bytes(), taker.key().as_ref()],
        bump
    )]
    pub taker_position: Account<'info, Position>,

    /// CHECK: vault
    #[account(mut, seeds = [VAULT_SEED], bump = market.vault_bump)]
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn fill_order_handler(ctx: Context<FillOrder>, fill_qty: u64) -> Result<()> {
    require!(fill_qty >= 1, MarketError::InvalidQuantity);

    let order = &mut ctx.accounts.order;
    require!(
        fill_qty <= order.qty_remaining,
        MarketError::InsufficientRemaining
    );

    let price_bps = order.price_bps;
    let complement = PRICE_BPS_SCALE
        .checked_sub(price_bps)
        .ok_or(MarketError::MathOverflow)?;

    let taker_escrow = fill_qty
        .checked_mul(CONTRACT_LAMPORTS)
        .and_then(|v| v.checked_mul(complement))
        .and_then(|v| v.checked_div(PRICE_BPS_SCALE))
        .ok_or(MarketError::MathOverflow)?;

    let maker_portion = fill_qty
        .checked_mul(CONTRACT_LAMPORTS)
        .and_then(|v| v.checked_mul(price_bps))
        .and_then(|v| v.checked_div(PRICE_BPS_SCALE))
        .ok_or(MarketError::MathOverflow)?;

    require!(
        order.escrow_lamports >= maker_portion,
        MarketError::InsufficientEscrow
    );

    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.taker.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        taker_escrow,
    )?;

    // Maker keeps their posted side; taker takes the opposite.
    // Cost basis = lamports each side locked for this fill.
    let (
        maker_yes,
        maker_no,
        maker_yes_cost,
        maker_no_cost,
        taker_yes,
        taker_no,
        taker_yes_cost,
        taker_no_cost,
    ) = match order.side {
        Side::Yes => (
            fill_qty,
            0u64,
            maker_portion,
            0u64,
            0u64,
            fill_qty,
            0u64,
            taker_escrow,
        ),
        Side::No => (
            0u64,
            fill_qty,
            0u64,
            maker_portion,
            fill_qty,
            0u64,
            taker_escrow,
            0u64,
        ),
    };

    let bet_id = order.bet_id;
    {
        let mp = &mut ctx.accounts.maker_position;
        if mp.owner == Pubkey::default() {
            mp.bet_id = bet_id;
            mp.owner = ctx.accounts.maker.key();
            mp.yes_contracts = 0;
            mp.no_contracts = 0;
            mp.yes_cost_lamports = 0;
            mp.no_cost_lamports = 0;
            mp.claimed = false;
            mp.bump = ctx.bumps.maker_position;
        }
        mp.yes_contracts = mp
            .yes_contracts
            .checked_add(maker_yes)
            .ok_or(MarketError::MathOverflow)?;
        mp.no_contracts = mp
            .no_contracts
            .checked_add(maker_no)
            .ok_or(MarketError::MathOverflow)?;
        mp.yes_cost_lamports = mp
            .yes_cost_lamports
            .checked_add(maker_yes_cost)
            .ok_or(MarketError::MathOverflow)?;
        mp.no_cost_lamports = mp
            .no_cost_lamports
            .checked_add(maker_no_cost)
            .ok_or(MarketError::MathOverflow)?;
    }
    {
        let tp = &mut ctx.accounts.taker_position;
        if tp.owner == Pubkey::default() {
            tp.bet_id = bet_id;
            tp.owner = ctx.accounts.taker.key();
            tp.yes_contracts = 0;
            tp.no_contracts = 0;
            tp.yes_cost_lamports = 0;
            tp.no_cost_lamports = 0;
            tp.claimed = false;
            tp.bump = ctx.bumps.taker_position;
        }
        tp.yes_contracts = tp
            .yes_contracts
            .checked_add(taker_yes)
            .ok_or(MarketError::MathOverflow)?;
        tp.no_contracts = tp
            .no_contracts
            .checked_add(taker_no)
            .ok_or(MarketError::MathOverflow)?;
        tp.yes_cost_lamports = tp
            .yes_cost_lamports
            .checked_add(taker_yes_cost)
            .ok_or(MarketError::MathOverflow)?;
        tp.no_cost_lamports = tp
            .no_cost_lamports
            .checked_add(taker_no_cost)
            .ok_or(MarketError::MathOverflow)?;
    }

    order.qty_remaining = order
        .qty_remaining
        .checked_sub(fill_qty)
        .ok_or(MarketError::MathOverflow)?;
    order.escrow_lamports = order
        .escrow_lamports
        .checked_sub(maker_portion)
        .ok_or(MarketError::MathOverflow)?;
    if order.qty_remaining == 0 {
        order.status = OrderStatus::Filled;
    }

    msg!("Filled order {} qty={}", order.order_id, fill_qty);
    Ok(())
}
