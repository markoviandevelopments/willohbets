use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{BET_SEED, MARKET_SEED, ORDER_SEED, VAULT_SEED};
use crate::error::MarketError;
use crate::state::{Bet, Market, Order, OrderStatus};

#[derive(Accounts)]
pub struct CancelOrder<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(seeds = [MARKET_SEED], bump = market.bump)]
    pub market: Account<'info, Market>,

    #[account(
        seeds = [BET_SEED, &order.bet_id.to_le_bytes()],
        bump = bet.bump
    )]
    pub bet: Account<'info, Bet>,

    #[account(
        mut,
        seeds = [ORDER_SEED, &order.bet_id.to_le_bytes(), &order.order_id.to_le_bytes()],
        bump = order.bump,
        has_one = owner,
        constraint = order.status == OrderStatus::Open @ MarketError::OrderNotOpen,
    )]
    pub order: Account<'info, Order>,

    /// CHECK: vault
    #[account(mut, seeds = [VAULT_SEED], bump = market.vault_bump)]
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn cancel_order_handler(ctx: Context<CancelOrder>) -> Result<()> {
    let refund = ctx.accounts.order.escrow_lamports;
    if refund > 0 {
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
            refund,
        )?;
    }

    let order = &mut ctx.accounts.order;
    order.escrow_lamports = 0;
    order.qty_remaining = 0;
    order.status = OrderStatus::Cancelled;
    msg!("Order {} cancelled", order.order_id);
    Ok(())
}
