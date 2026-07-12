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

export function getProgram(connection: Connection, wallet: AnchorWallet) {
  const provider = new AnchorProvider(connection, wallet, {
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

export async function fetchMarket(connection: Connection, wallet: AnchorWallet) {
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
  wallet: AnchorWallet,
): Promise<BetEntry[]> {
  const program = getProgram(connection, wallet)
  const all = (await accounts(program).bet.all()) as BetEntry[]
  return all.sort(
    (a, b) => b.account.betId.toNumber() - a.account.betId.toNumber(),
  )
}

export async function fetchOpenOrders(
  connection: Connection,
  wallet: AnchorWallet,
  betId: number,
): Promise<OrderBookEntry[]> {
  const program = getProgram(connection, wallet)
  const all = (await accounts(program).order.all()) as OrderBookEntry[]
  return all.filter(
    (o) =>
      o.account.betId.toNumber() === betId &&
      'open' in o.account.status &&
      o.account.qtyRemaining.toNumber() > 0,
  )
}

export async function fetchPosition(
  connection: Connection,
  wallet: AnchorWallet,
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

export async function initializeMarket(
  connection: Connection,
  wallet: AnchorWallet,
) {
  const program = getProgram(connection, wallet)
  const [market] = marketPda()
  const [vault] = vaultPda()
  return methods(program)
    .initializeMarket()
    .accounts({
      authority: wallet.publicKey,
      market,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
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
  return methods(program)
    .createBet(name)
    .accounts({
      creator: wallet.publicKey,
      market: market.publicKey,
      bet,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
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
  return methods(program)
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
  return methods(program)
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
  return methods(program)
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
  return methods(program)
    .settleBet(outcomeArg)
    .accounts({
      settler: wallet.publicKey,
      market,
      bet,
    })
    .rpc()
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
  return methods(program)
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
