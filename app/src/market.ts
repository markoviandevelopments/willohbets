import { AnchorProvider, BN, Program, type Idl } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import type { AnchorWallet } from '@solana/wallet-adapter-react'
import idl from './idl/coinflip.json'

export const PROGRAM_ID = new PublicKey((idl as { address: string }).address)
export const CONTRACT_LAMPORTS = 1_000_000
export const CONTRACT_SOL = 0.001
export const PRICE_BPS_SCALE = 10_000

export const MODERATOR_PASSWORD = 'willohrocks'
export const MOD_SESSION_KEY = 'willohbets_mod'

export type Side = { yes: object } | { no: object }
export type OrderStatus =
  | { open: object }
  | { filled: object }
  | { cancelled: object }
export type BetStatus = { open: object } | { settled: object }
export type Outcome =
  | { undecided: object }
  | { yes: object }
  | { no: object }
  | { void: object }

export type MarketAccount = {
  authority: PublicKey
  nextBetId: BN
  nextOrderId: BN
  bump: number
  vaultBump: number
}

export type BetAccount = {
  betId: BN
  creator: PublicKey
  name: string
  createdTs: BN
  settledTs: BN
  status: BetStatus
  outcome: Outcome
  bump: number
}

export type OrderAccount = {
  orderId: BN
  betId: BN
  owner: PublicKey
  side: Side
  priceBps: BN
  qtyTotal: BN
  qtyRemaining: BN
  escrowLamports: BN
  status: OrderStatus
  bump: number
}

export type PositionAccount = {
  betId: BN
  owner: PublicKey
  yesContracts: BN
  noContracts: BN
  yesCostLamports: BN
  noCostLamports: BN
  claimed: boolean
  bump: number
}

export type BetEntry = { publicKey: PublicKey; account: BetAccount }
export type OrderBookEntry = { publicKey: PublicKey; account: OrderAccount }

/** Dummy wallet for read-only account fetches (no signature needed). */
function readonlyWallet(): AnchorWallet {
  const pk = PublicKey.default
  return {
    publicKey: pk,
    signTransaction: async (tx) => tx,
    signAllTransactions: async (txs) => txs,
  } as AnchorWallet
}

export function getProgram(connection: Connection, wallet?: AnchorWallet | null) {
  const provider = new AnchorProvider(connection, wallet ?? readonlyWallet(), {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  })
  return new Program(idl as Idl, provider)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function methods(program: Program): any {
  return program.methods
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function accounts(program: Program): any {
  return program.account
}

/** In-memory cache so refresh doesn't re-hit RPC for every piece. */
let cache: {
  at: number
  market: { publicKey: PublicKey; account: MarketAccount } | null
  bets: BetEntry[]
  orders: OrderBookEntry[]
} | null = null

/** Public free RPCs rate-limit getProgramAccounts hard; keep cache longer. */
const CACHE_MS = 15_000
/** Max (nextBetId × nextOrderId) combos for order PDA enumeration. */
const MAX_ORDER_ENUM = 500
const MULTI_BATCH = 100

export function invalidateMarketCache() {
  cache = null
}

/**
 * Fetch accounts by known PDAs via getMultipleAccounts (cheap).
 * Avoids program.account.*.all() → getProgramAccounts, which public
 * Solana devnet RPC frequently 429s ("Too many requests for a specific RPC call").
 */
async function fetchMultipleByKeys<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accountClient: { fetchMultiple: (keys: PublicKey[]) => Promise<(T | null)[]> },
  keys: PublicKey[],
): Promise<{ publicKey: PublicKey; account: T }[]> {
  const out: { publicKey: PublicKey; account: T }[] = []
  for (let i = 0; i < keys.length; i += MULTI_BATCH) {
    const chunk = keys.slice(i, i + MULTI_BATCH)
    const accounts = await accountClient.fetchMultiple(chunk)
    for (let j = 0; j < accounts.length; j++) {
      const acc = accounts[j]
      if (acc) out.push({ publicKey: chunk[j]!, account: acc })
    }
  }
  return out
}

/** List bets 0..nextBetId-1 by PDA (missing indices are skipped). */
async function listBetsByMarket(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  program: Program,
  nextBetId: number,
): Promise<BetEntry[]> {
  if (nextBetId <= 0) return []
  const keys: PublicKey[] = []
  for (let i = 0; i < nextBetId; i++) keys.push(betPda(i)[0])
  return fetchMultipleByKeys<BetAccount>(accounts(program).bet, keys)
}

/**
 * List orders by enumerating (betId, orderId) PDAs from market counters.
 * Falls back to getProgramAccounts only if the combo space is huge.
 */
async function listOrdersByMarket(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  program: Program,
  nextBetId: number,
  nextOrderId: number,
): Promise<OrderBookEntry[]> {
  if (nextOrderId <= 0 || nextBetId <= 0) return []
  const combos = nextBetId * nextOrderId
  if (combos > MAX_ORDER_ENUM) {
    return (await accounts(program).order.all()) as OrderBookEntry[]
  }
  const keys: PublicKey[] = []
  for (let bid = 0; bid < nextBetId; bid++) {
    for (let oid = 0; oid < nextOrderId; oid++) {
      keys.push(orderPda(bid, oid)[0])
    }
  }
  return fetchMultipleByKeys<OrderAccount>(accounts(program).order, keys)
}

export function marketPda() {
  return PublicKey.findProgramAddressSync([Buffer.from('willoh_market')], PROGRAM_ID)
}
export function vaultPda() {
  return PublicKey.findProgramAddressSync([Buffer.from('willoh_vault')], PROGRAM_ID)
}
export function betPda(betId: number | BN) {
  const id = BN.isBN(betId) ? betId : new BN(betId)
  return PublicKey.findProgramAddressSync(
    [Buffer.from('willoh_bet'), id.toArrayLike(Buffer, 'le', 8)],
    PROGRAM_ID,
  )
}
export function orderPda(betId: number | BN, orderId: number | BN) {
  const b = BN.isBN(betId) ? betId : new BN(betId)
  const o = BN.isBN(orderId) ? orderId : new BN(orderId)
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('willoh_order'),
      b.toArrayLike(Buffer, 'le', 8),
      o.toArrayLike(Buffer, 'le', 8),
    ],
    PROGRAM_ID,
  )
}
export function positionPda(betId: number | BN, owner: PublicKey) {
  const b = BN.isBN(betId) ? betId : new BN(betId)
  return PublicKey.findProgramAddressSync(
    [Buffer.from('willoh_pos_v2'), b.toArrayLike(Buffer, 'le', 8), owner.toBuffer()],
    PROGRAM_ID,
  )
}

/** Average fill price as % of full contract payout (0–100). */
export function avgPricePercent(costLamports: BN | number, contracts: BN | number): number | null {
  const cost = typeof costLamports === 'number' ? costLamports : costLamports.toNumber()
  const qty = typeof contracts === 'number' ? contracts : contracts.toNumber()
  if (qty <= 0) return null
  // cost / (qty * CONTRACT) * 100
  return (cost / (qty * CONTRACT_LAMPORTS)) * 100
}

/** Average SOL paid per contract. */
export function avgPriceSol(costLamports: BN | number, contracts: BN | number): number | null {
  const cost = typeof costLamports === 'number' ? costLamports : costLamports.toNumber()
  const qty = typeof contracts === 'number' ? contracts : contracts.toNumber()
  if (qty <= 0) return null
  return cost / qty / 1e9
}

export async function fetchMarket(
  connection: Connection,
  wallet?: AnchorWallet | null,
) {
  const program = getProgram(connection, wallet)
  const [pda] = marketPda()
  try {
    return {
      publicKey: pda,
      account: (await accounts(program).market.fetch(pda)) as MarketAccount,
    }
  } catch {
    return null
  }
}

export async function fetchAllBets(
  connection: Connection,
  wallet?: AnchorWallet | null,
): Promise<BetEntry[]> {
  const program = getProgram(connection, wallet)
  const market = await fetchMarket(connection, wallet)
  if (!market) return []
  const all = await listBetsByMarket(
    program,
    market.account.nextBetId.toNumber(),
  )
  return all.sort(
    (a, b) => b.account.betId.toNumber() - a.account.betId.toNumber(),
  )
}

export async function fetchAllOrders(
  connection: Connection,
  wallet?: AnchorWallet | null,
): Promise<OrderBookEntry[]> {
  const program = getProgram(connection, wallet)
  const market = await fetchMarket(connection, wallet)
  if (!market) return []
  return listOrdersByMarket(
    program,
    market.account.nextBetId.toNumber(),
    market.account.nextOrderId.toNumber(),
  )
}

export async function fetchOpenOrders(
  connection: Connection,
  wallet: AnchorWallet | null | undefined,
  betId: number,
): Promise<OrderBookEntry[]> {
  const all = await fetchAllOrders(connection, wallet)
  return all.filter(
    (o) =>
      o.account.betId.toNumber() === betId &&
      'open' in o.account.status &&
      o.account.qtyRemaining.toNumber() > 0,
  )
}

export async function fetchPosition(
  connection: Connection,
  wallet: AnchorWallet | null | undefined,
  betId: number,
  owner: PublicKey,
) {
  const program = getProgram(connection, wallet)
  const [pda] = positionPda(betId, owner)
  try {
    return {
      publicKey: pda,
      account: (await accounts(program).position.fetch(pda)) as PositionAccount,
    }
  } catch {
    return null
  }
}

/**
 * Market + bets + orders with short cache.
 * Bets/orders load by PDA enumeration (getMultipleAccounts), not getProgramAccounts.
 * On failure, keep last good cache so the UI does not flash empty.
 */
export async function fetchMarketSnapshot(
  connection: Connection,
  opts?: { force?: boolean; wallet?: AnchorWallet | null },
): Promise<{
  market: { publicKey: PublicKey; account: MarketAccount } | null
  bets: BetEntry[]
  orders: OrderBookEntry[]
  error?: string
}> {
  const now = Date.now()
  if (!opts?.force && cache && now - cache.at < CACHE_MS) {
    return {
      market: cache.market,
      bets: cache.bets,
      orders: cache.orders,
    }
  }

  const wallet = opts?.wallet ?? null
  const program = getProgram(connection, wallet)
  const [pda] = marketPda()

  try {
    const marketAccount = (await accounts(program).market.fetch(
      pda,
    )) as MarketAccount
    const market = { publicKey: pda, account: marketAccount }
    const nextBetId = marketAccount.nextBetId.toNumber()
    const nextOrderId = marketAccount.nextOrderId.toNumber()

    const [betsSettled, ordersSettled] = await Promise.allSettled([
      listBetsByMarket(program, nextBetId),
      listOrdersByMarket(program, nextBetId, nextOrderId),
    ])

    const betsOk = betsSettled.status === 'fulfilled'
    const ordersOk = ordersSettled.status === 'fulfilled'
    const bets = betsOk
      ? [...betsSettled.value].sort(
          (a, b) => b.account.betId.toNumber() - a.account.betId.toNumber(),
        )
      : (cache?.bets ?? [])
    const orders = ordersOk ? ordersSettled.value : (cache?.orders ?? [])

    // Only advance cache timestamp when at least bets succeeded (or both empty markets)
    if (betsOk || ordersOk || nextBetId === 0) {
      cache = { at: Date.now(), market, bets, orders }
    } else if (cache) {
      cache = { ...cache, market }
    } else {
      cache = { at: Date.now(), market, bets, orders }
    }

    const errs: string[] = []
    if (!betsOk) {
      errs.push(
        betsSettled.reason instanceof Error
          ? betsSettled.reason.message
          : String(betsSettled.reason),
      )
    }
    if (!ordersOk) {
      errs.push(
        ordersSettled.reason instanceof Error
          ? ordersSettled.reason.message
          : String(ordersSettled.reason),
      )
    }

    return {
      market,
      bets,
      orders,
      error: errs.length ? errs.join('; ') : undefined,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (cache) {
      return {
        market: cache.market,
        bets: cache.bets,
        orders: cache.orders,
        error: msg,
      }
    }
    return { market: null, bets: [], orders: [], error: msg }
  }
}

export function openOrdersForBet(
  orders: OrderBookEntry[],
  betId: number,
): OrderBookEntry[] {
  return orders.filter(
    (o) =>
      o.account.betId.toNumber() === betId &&
      'open' in o.account.status &&
      o.account.qtyRemaining.toNumber() > 0,
  )
}

export async function initializeMarket(
  connection: Connection,
  wallet: AnchorWallet,
) {
  const program = getProgram(connection, wallet)
  const [market] = marketPda()
  const [vault] = vaultPda()
  const sig = await methods(program)
    .initializeMarket()
    .accounts({
      authority: wallet.publicKey,
      market,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  invalidateMarketCache()
  return sig
}

export async function createBet(
  connection: Connection,
  wallet: AnchorWallet,
  name: string,
) {
  const program = getProgram(connection, wallet)
  const market = await fetchMarket(connection, wallet)
  if (!market) throw new Error('Market not initialized')
  const betId = market.account.nextBetId.toNumber()
  const [bet] = betPda(betId)
  const sig = await methods(program)
    .createBet(name)
    .accounts({
      creator: wallet.publicKey,
      market: market.publicKey,
      bet,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  invalidateMarketCache()
  return sig
}

export async function placeOrder(
  connection: Connection,
  wallet: AnchorWallet,
  betId: number,
  side: 'yes' | 'no',
  priceBps: number,
  quantity: number,
) {
  const program = getProgram(connection, wallet)
  const market = await fetchMarket(connection, wallet)
  if (!market) throw new Error('Market not initialized')
  const orderId = market.account.nextOrderId.toNumber()
  const [bet] = betPda(betId)
  const [order] = orderPda(betId, orderId)
  const [vault] = vaultPda()
  const sideArg = side === 'yes' ? { yes: {} } : { no: {} }
  const sig = await methods(program)
    .placeOrder(new BN(betId), sideArg, new BN(priceBps), new BN(quantity))
    .accounts({
      owner: wallet.publicKey,
      market: market.publicKey,
      bet,
      order,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  invalidateMarketCache()
  return sig
}

export async function fillOrder(
  connection: Connection,
  wallet: AnchorWallet,
  orderEntry: OrderBookEntry,
  fillQty: number,
) {
  const program = getProgram(connection, wallet)
  const market = await fetchMarket(connection, wallet)
  if (!market) throw new Error('Market not initialized')
  const betId = orderEntry.account.betId.toNumber()
  const [bet] = betPda(betId)
  const [vault] = vaultPda()
  const maker = orderEntry.account.owner
  const [makerPosition] = positionPda(betId, maker)
  const [takerPosition] = positionPda(betId, wallet.publicKey)
  const sig = await methods(program)
    .fillOrder(new BN(fillQty))
    .accounts({
      taker: wallet.publicKey,
      maker,
      market: market.publicKey,
      bet,
      order: orderEntry.publicKey,
      makerPosition,
      takerPosition,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  invalidateMarketCache()
  return sig
}

export async function cancelOrder(
  connection: Connection,
  wallet: AnchorWallet,
  orderEntry: OrderBookEntry,
) {
  const program = getProgram(connection, wallet)
  const [market] = marketPda()
  const [bet] = betPda(orderEntry.account.betId)
  const [vault] = vaultPda()
  const sig = await methods(program)
    .cancelOrder()
    .accounts({
      owner: wallet.publicKey,
      market,
      bet,
      order: orderEntry.publicKey,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  invalidateMarketCache()
  return sig
}

export async function settleBet(
  connection: Connection,
  wallet: AnchorWallet,
  betId: number,
  outcome: 'yes' | 'no' | 'void',
) {
  const program = getProgram(connection, wallet)
  const [market] = marketPda()
  const [bet] = betPda(betId)
  const outcomeArg =
    outcome === 'yes'
      ? { yes: {} }
      : outcome === 'no'
        ? { no: {} }
        : { void: {} }
  const sig = await methods(program)
    .settleBet(outcomeArg)
    .accounts({
      settler: wallet.publicKey,
      market,
      bet,
    })
    .rpc()
  invalidateMarketCache()
  return sig
}

export async function claim(
  connection: Connection,
  wallet: AnchorWallet,
  betId: number,
) {
  const program = getProgram(connection, wallet)
  const [market] = marketPda()
  const [bet] = betPda(betId)
  const [position] = positionPda(betId, wallet.publicKey)
  const [vault] = vaultPda()
  const sig = await methods(program)
    .claim()
    .accounts({
      owner: wallet.publicKey,
      market,
      bet,
      position,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  invalidateMarketCache()
  return sig
}

export function sideIsYes(side: Side): boolean {
  return 'yes' in side
}

export function outcomeLabel(o: Outcome): string {
  if ('yes' in o) return 'YES'
  if ('no' in o) return 'NO'
  if ('void' in o) return 'VOID'
  return '—'
}

export function betIsOpen(b: BetAccount): boolean {
  return 'open' in b.status
}

export function escrowForOrder(priceBps: number, qty: number): number {
  return (qty * CONTRACT_LAMPORTS * priceBps) / PRICE_BPS_SCALE / 1e9
}

export function takerCostSol(makerPriceBps: number, qty: number): number {
  const complement = PRICE_BPS_SCALE - makerPriceBps
  return (qty * CONTRACT_LAMPORTS * complement) / PRICE_BPS_SCALE / 1e9
}

export function isModeratorSession(): boolean {
  try {
    return sessionStorage.getItem(MOD_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function setModeratorSession(on: boolean) {
  try {
    if (on) sessionStorage.setItem(MOD_SESSION_KEY, '1')
    else sessionStorage.removeItem(MOD_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export type DepthLevel = {
  /** Price as % of full payout (0–100) */
  pricePct: number
  priceBps: number
  qty: number
  /** Cumulative qty from best price through this level */
  cumulative: number
  side: 'yes' | 'no'
}

/** Aggregate open orders into depth levels (best price first). */
export function buildDepth(
  orders: OrderBookEntry[],
  side: 'yes' | 'no',
): DepthLevel[] {
  const filtered = orders.filter((o) =>
    side === 'yes' ? sideIsYes(o.account.side) : !sideIsYes(o.account.side),
  )
  const byPrice = new Map<number, number>()
  for (const o of filtered) {
    const p = o.account.priceBps.toNumber()
    const q = o.account.qtyRemaining.toNumber()
    byPrice.set(p, (byPrice.get(p) ?? 0) + q)
  }
  const levels = [...byPrice.entries()]
    .map(([priceBps, qty]) => ({
      priceBps,
      pricePct: priceBps / 100,
      qty,
      cumulative: 0,
      side,
    }))
    .sort((a, b) => b.priceBps - a.priceBps)

  let cum = 0
  for (const lvl of levels) {
    cum += lvl.qty
    lvl.cumulative = cum
  }
  return levels
}

export type PositionMark = {
  totalPaidSol: number
  /** Value that can be locked using resting opposite liquidity */
  coveredValueSol: number
  yesCovered: number
  noCovered: number
  yesUncovered: number
  noUncovered: number
  /** Residual marked at remaining same-side bids (if any depth left) */
  residualBidValueSol: number
  /** coveredValue + residualBidValue */
  marketValueSol: number
  /** marketValue - totalPaid */
  unrealizedPnlSol: number
  hedgeCostSol: number
  note: string
}

/**
 * Mark position against the resting book.
 *
 * - Negate YES by taking YES bids (taker receives NO, pays complement).
 * - Negate NO by taking NO bids (taker receives YES, pays complement).
 * - Fully hedged units lock in 1 contract payout − hedge cost.
 * - Any leftover inventory is marked at remaining same-side bids (what
 *   buyers are willing to pay for that side), if depth remains.
 */
export function markPositionAgainstBook(
  position: PositionAccount | null,
  yesBids: OrderBookEntry[],
  noBids: OrderBookEntry[],
): PositionMark | null {
  if (!position) return null

  const yesQty = position.yesContracts.toNumber()
  const noQty = position.noContracts.toNumber()
  const yesCost = position.yesCostLamports.toNumber() / 1e9
  const noCost = position.noCostLamports.toNumber() / 1e9
  const totalPaidSol = yesCost + noCost

  if (yesQty === 0 && noQty === 0) {
    return {
      totalPaidSol,
      coveredValueSol: 0,
      yesCovered: 0,
      noCovered: 0,
      yesUncovered: 0,
      noUncovered: 0,
      residualBidValueSol: 0,
      marketValueSol: 0,
      unrealizedPnlSol: -totalPaidSol,
      hedgeCostSol: 0,
      note: 'No contracts held',
    }
  }

  // 1) Internal net: YES+NO pairs already lock full payout with no extra cost
  const internalPairs = Math.min(yesQty, noQty)
  const internalValueSol = internalPairs * CONTRACT_SOL
  let yesLeft = yesQty - internalPairs
  let noLeft = noQty - internalPairs

  // 2) Book hedge residual longs against opposite resting liquidity
  const yesDepth = cloneDepth(yesBids)
  const noDepth = cloneDepth(noBids)

  // Hedge leftover YES → buy NO by taking YES bids
  const hedgeYes = walkTakeOpposite(yesDepth, yesLeft)
  // Hedge leftover NO → buy YES by taking NO bids
  const hedgeNo = walkTakeOpposite(noDepth, noLeft)

  const yesCovered = internalPairs + hedgeYes.filled
  const noCovered = internalPairs + hedgeNo.filled
  const hedgeCostSol = hedgeYes.costSol + hedgeNo.costSol
  // Hedged-via-book units: lock CONTRACT after paying hedge cost
  const bookHedgeValueSol =
    hedgeYes.filled * CONTRACT_SOL -
    hedgeYes.costSol +
    (hedgeNo.filled * CONTRACT_SOL - hedgeNo.costSol)
  const coveredValueSol = internalValueSol + bookHedgeValueSol

  const yesUncovered = yesLeft - hedgeYes.filled
  const noUncovered = noLeft - hedgeNo.filled

  // 3) Residual: mark-to-bid on remaining same-side depth
  const residualBidValueSol =
    walkSellToBids(yesDepth, yesUncovered) + walkSellToBids(noDepth, noUncovered)

  const marketValueSol = coveredValueSol + residualBidValueSol
  const uncoveredUnits = yesUncovered + noUncovered
  let note = ''
  if (uncoveredUnits === 0) {
    if (hedgeYes.filled + hedgeNo.filled > 0 && internalPairs > 0) {
      note = 'Fully covered (internal pairs + book hedge)'
    } else if (internalPairs > 0) {
      note = 'Fully covered by internal YES/NO pairs'
    } else {
      note = 'Fully covered by resting opposite-side liquidity'
    }
  } else if (coveredValueSol > 0 && residualBidValueSol > 0) {
    note = 'Partially covered; residual marked to remaining bids'
  } else if (coveredValueSol > 0) {
    note = `Partially covered; ${uncoveredUnits} uncovered (no residual bid depth)`
  } else if (residualBidValueSol > 0) {
    note = 'No hedge depth; marked to same-side bids only'
  } else {
    note = 'Insufficient book depth to mark position'
  }

  return {
    totalPaidSol,
    coveredValueSol,
    yesCovered,
    noCovered,
    yesUncovered,
    noUncovered,
    residualBidValueSol,
    marketValueSol,
    unrealizedPnlSol: marketValueSol - totalPaidSol,
    hedgeCostSol,
    note,
  }
}

type MutableLevel = { priceBps: number; qty: number }

function cloneDepth(orders: OrderBookEntry[]): MutableLevel[] {
  const byPrice = new Map<number, number>()
  for (const o of orders) {
    const p = o.account.priceBps.toNumber()
    const q = o.account.qtyRemaining.toNumber()
    byPrice.set(p, (byPrice.get(p) ?? 0) + q)
  }
  return [...byPrice.entries()]
    .map(([priceBps, qty]) => ({ priceBps, qty }))
    .sort((a, b) => b.priceBps - a.priceBps)
}

/** Take opposite side of resting bids: pay complement, consume depth. */
function walkTakeOpposite(
  depth: MutableLevel[],
  need: number,
): { filled: number; costSol: number } {
  let needLeft = need
  let filled = 0
  let costSol = 0
  for (const lvl of depth) {
    if (needLeft <= 0) break
    if (lvl.qty <= 0) continue
    const take = Math.min(needLeft, lvl.qty)
    const complement = (PRICE_BPS_SCALE - lvl.priceBps) / PRICE_BPS_SCALE
    costSol += take * complement * CONTRACT_SOL
    lvl.qty -= take
    needLeft -= take
    filled += take
  }
  return { filled, costSol }
}

/** Mark residual inventory at remaining bid prices (sell-to-bid). */
function walkSellToBids(depth: MutableLevel[], qty: number): number {
  let left = qty
  let value = 0
  for (const lvl of depth) {
    if (left <= 0) break
    if (lvl.qty <= 0) continue
    const take = Math.min(left, lvl.qty)
    const px = lvl.priceBps / PRICE_BPS_SCALE
    value += take * px * CONTRACT_SOL
    lvl.qty -= take
    left -= take
  }
  return value
}
