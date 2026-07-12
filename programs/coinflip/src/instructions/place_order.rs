use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{
    BET_SEED, CONTRACT_LAMPORTS, MARKET_SEED, MAX_PRICE_BPS, MIN_PRICE_BPS, ORDER_SEED,
    PRICE_BPS_SCALE, VAULT_SEED,
};
use crate::error::MarketError;
use crate::state::{Bet, BetStatus, Market, Order, OrderStatus, Side};

#[derive(Accounts)]
#[instruction(bet_id: u64)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED],
        bump = market.bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        seeds = [BET_SEED, &bet_id.to_le_bytes()],
        bump = bet.bump,
        constraint = bet.bet_id == bet_id,
        constraint = bet.status == BetStatus::Open @ MarketError::BetNotOpen,
    )]
    pub bet: Account<'info, Bet>,

    #[account(
        init,
        payer = owner,
        space = 8 + Order::INIT_SPACE,
        seeds = [ORDER_SEED, &bet_id.to_le_bytes(), &market.next_order_id.to_le_bytes()],
        bump
    )]
    pub order: Account<'info, Order>,

    /// CHECK: vault
    #[account(mut, seeds = [VAULT_SEED], bump = market.vault_bump)]
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn place_order_handler(
    ctx: Context<PlaceOrder>,
    bet_id: u64,
    side: Side,
    price_bps: u64,
    quantity: u64,
) -> Result<()> {
    require!(
        price_bps >= MIN_PRICE_BPS && price_bps <= MAX_PRICE_BPS,
        MarketError::InvalidPrice
    );
    require!(quantity >= 1, MarketError::InvalidQuantity);

    let escrow = quantity
        .checked_mul(CONTRACT_LAMPORTS)
        .and_then(|v| v.checked_mul(price_bps))
        .and_then(|v| v.checked_div(PRICE_BPS_SCALE))
        .ok_or(MarketError::MathOverflow)?;
    require!(escrow > 0, MarketError::InsufficientEscrow);

    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        escrow,
    )?;

    let market = &mut ctx.accounts.market;
    let order_id = market.next_order_id;
    market.next_order_id = order_id
        .checked_add(1)
        .ok_or(MarketError::MathOverflow)?;

    let order = &mut ctx.accounts.order;
    order.order_id = order_id;
    order.bet_id = bet_id;
    order.owner = ctx.accounts.owner.key();
    order.side = side;
    order.price_bps = price_bps;
    order.qty_total = quantity;
    order.qty_remaining = quantity;
    order.escrow_lamports = escrow;
    order.status = OrderStatus::Open;
    order.bump = ctx.bumps.order;

    msg!(
        "Order {} on bet {} side={:?} price={} qty={}",
        order_id,
        bet_id,
        side,
        price_bps,
        quantity
    );
    Ok(())
}
