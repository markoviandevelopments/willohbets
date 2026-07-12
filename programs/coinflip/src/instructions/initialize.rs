use anchor_lang::prelude::*;
use anchor_lang::system_program::{create_account, CreateAccount};

use crate::constants::{MARKET_SEED, VAULT_SEED};
use crate::state::Market;

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Market::INIT_SPACE,
        seeds = [MARKET_SEED],
        bump
    )]
    pub market: Account<'info, Market>,

    /// CHECK: system-owned vault PDA
    #[account(mut, seeds = [VAULT_SEED], bump)]
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_market_handler(ctx: Context<InitializeMarket>) -> Result<()> {
    let vault_bump = ctx.bumps.vault;
    let market_bump = ctx.bumps.market;

    if ctx.accounts.vault.lamports() == 0 {
        let rent = Rent::get()?.minimum_balance(0);
        let seeds: &[&[u8]] = &[VAULT_SEED, &[vault_bump]];
        create_account(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                CreateAccount {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
                &[seeds],
            ),
            rent,
            0,
            &anchor_lang::system_program::ID,
        )?;
    }

    let market = &mut ctx.accounts.market;
    market.authority = ctx.accounts.authority.key();
    market.next_bet_id = 1;
    market.next_order_id = 1;
    market.bump = market_bump;
    market.vault_bump = vault_bump;

    msg!("WillohBets market initialized");
    Ok(())
}
