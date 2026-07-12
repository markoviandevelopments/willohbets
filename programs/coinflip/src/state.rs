use anchor_lang::prelude::*;

use crate::constants::MAX_BET_NAME_LEN;

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub authority: Pubkey,
    pub next_bet_id: u64,
    pub next_order_id: u64,
    pub bump: u8,
    pub vault_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub bet_id: u64,
    pub creator: Pubkey,
    #[max_len(MAX_BET_NAME_LEN)]
    pub name: String,
    pub created_ts: i64,
    pub settled_ts: i64,
    pub status: BetStatus,
    pub outcome: Outcome,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Order {
    pub order_id: u64,
    pub bet_id: u64,
    pub owner: Pubkey,
    pub side: Side,
    pub price_bps: u64,
    pub qty_total: u64,
    pub qty_remaining: u64,
    pub escrow_lamports: u64,
    pub status: OrderStatus,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Position {
    pub bet_id: u64,
    pub owner: Pubkey,
    pub yes_contracts: u64,
    pub no_contracts: u64,
    pub claimed: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum BetStatus {
    Open,
    Settled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum Outcome {
    Undecided,
    Yes,
    No,
    Void,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum Side {
    Yes,
    No,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum OrderStatus {
    Open,
    Filled,
    Cancelled,
}
