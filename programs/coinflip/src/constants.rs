/// One contract settles to this many lamports if correct (0.001 SOL).
pub const CONTRACT_LAMPORTS: u64 = 1_000_000;

/// Price scale: 10_000 = 100% of contract value.
pub const PRICE_BPS_SCALE: u64 = 10_000;

pub const MIN_PRICE_BPS: u64 = 100;
pub const MAX_PRICE_BPS: u64 = 9_900;

pub const MAX_BET_NAME_LEN: usize = 64;

// Fresh seeds (v2) so we don't collide with the previous coinflip/BTC market layout.
pub const MARKET_SEED: &[u8] = b"willoh_market";
pub const VAULT_SEED: &[u8] = b"willoh_vault";
pub const BET_SEED: &[u8] = b"willoh_bet";
pub const ORDER_SEED: &[u8] = b"willoh_order";
/// v2 includes cost basis fields for average fill price.
pub const POSITION_SEED: &[u8] = b"willoh_pos_v2";
