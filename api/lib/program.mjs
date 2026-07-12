/**
 * Server-side Anchor program helpers for WillohBets agent API.
 * Signs txs with a local keypair — no browser wallet.
 */
import { readFileSync, existsSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import anchor from '@coral-xyz/anchor'

const { AnchorProvider, BN, Program, Wallet } = anchor

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_ROOT = join(__dirname, '..')

export const PROGRAM_ID = new PublicKey(
  'BPpvi9mmM8yzVbGofQARnsDjxdvVXioEbE5UB2F24uJb',
)
export const CONTRACT_LAMPORTS = 1_000_000
export const PRICE_BPS_SCALE = 10_000
export const MIN_PRICE_BPS = 100
export const MAX_PRICE_BPS = 9_900

const idl = JSON.parse(readFileSync(join(API_ROOT, 'idl.json'), 'utf8'))

/** Optional tiny .env loader (no dotenv dep). */
export function loadEnvFile(path = join(API_ROOT, '.env')) {
  if (!existsSync(path)) return
  const text = readFileSync(path, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

export function loadKeypair(path) {
  const p = resolve(
    path ||
      process.env.WILLOHBETS_KEYPAIR_PATH ||
      join(API_ROOT, 'agent-keypair.json'),
  )
  if (!existsSync(p)) {
    throw new Error(
      `Keypair not found at ${p}. Run: npm run gen-keypair (in api/)`,
    )
  }
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(readFileSync(p, 'utf8'))),
  )
}

export function getConnection() {
  const url = process.env.RPC_URL || 'https://api.devnet.solana.com'
  return new Connection(url, 'confirmed')
}

export function getClusterLabel(url) {
  if (!url) return 'devnet'
  if (url.includes('devnet')) return 'devnet'
  if (url.includes('mainnet')) return 'mainnet-beta'
  if (url.includes('testnet')) return 'testnet'
  if (url.includes('localhost') || url.includes('127.0.0.1')) return 'localnet'
  return 'custom'
}

let _keypair = null
let _program = null
let _connection = null

export function getKeypair() {
  if (!_keypair) _keypair = loadKeypair()
  return _keypair
}

export function getProgram() {
  if (_program) return _program
  _connection = getConnection()
  const kp = getKeypair()
  const wallet = new Wallet(kp)
  const provider = new AnchorProvider(_connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  })
  _program = new Program(idl, provider)
  return _program
}

export function getWalletPubkey() {
  return getKeypair().publicKey
}

// ── PDAs ────────────────────────────────────────────────────────────────────

export function marketPda() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('willoh_market')],
    PROGRAM_ID,
  )
}
export function vaultPda() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('willoh_vault')],
    PROGRAM_ID,
  )
}
export function betPda(betId) {
  const id = BN.isBN(betId) ? betId : new BN(betId)
  return PublicKey.findProgramAddressSync(
    [Buffer.from('willoh_bet'), id.toArrayLike(Buffer, 'le', 8)],
    PROGRAM_ID,
  )
}
export function orderPda(betId, orderId) {
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
export function positionPda(betId, owner) {
  const b = BN.isBN(betId) ? betId : new BN(betId)
  const ownerPk =
    owner instanceof PublicKey ? owner : new PublicKey(owner)
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('willoh_pos_v2'),
      b.toArrayLike(Buffer, 'le', 8),
      ownerPk.toBuffer(),
    ],
    PROGRAM_ID,
  )
}

// ── Serialize helpers ───────────────────────────────────────────────────────

function enumKey(obj) {
  if (!obj || typeof obj !== 'object') return null
  const keys = Object.keys(obj)
  return keys[0] ?? null
}

function bnToNum(v) {
  if (v == null) return v
  if (typeof v === 'number') return v
  if (typeof v === 'string') return Number(v)
  if (typeof v.toNumber === 'function') {
    try {
      return v.toNumber()
    } catch {
      return v.toString()
    }
  }
  return Number(v)
}

export function serializeBet(publicKey, account) {
  return {
    pubkey: publicKey.toBase58(),
    betId: bnToNum(account.betId),
    creator: account.creator.toBase58(),
    name: account.name,
    createdTs: bnToNum(account.createdTs),
    settledTs: bnToNum(account.settledTs),
    status: enumKey(account.status),
    outcome: enumKey(account.outcome),
  }
}

export function serializeOrder(publicKey, account) {
  return {
    pubkey: publicKey.toBase58(),
    orderId: bnToNum(account.orderId),
    betId: bnToNum(account.betId),
    owner: account.owner.toBase58(),
    side: enumKey(account.side),
    priceBps: bnToNum(account.priceBps),
    pricePct: bnToNum(account.priceBps) / 100,
    qtyTotal: bnToNum(account.qtyTotal),
    qtyRemaining: bnToNum(account.qtyRemaining),
    escrowLamports: bnToNum(account.escrowLamports),
    status: enumKey(account.status),
  }
}

export function serializePosition(publicKey, account) {
  return {
    pubkey: publicKey.toBase58(),
    betId: bnToNum(account.betId),
    owner: account.owner.toBase58(),
    yesContracts: bnToNum(account.yesContracts),
    noContracts: bnToNum(account.noContracts),
    yesCostLamports: bnToNum(account.yesCostLamports),
    noCostLamports: bnToNum(account.noCostLamports),
    claimed: !!account.claimed,
  }
}

export function serializeMarket(publicKey, account) {
  return {
    pubkey: publicKey.toBase58(),
    authority: account.authority.toBase58(),
    nextBetId: bnToNum(account.nextBetId),
    nextOrderId: bnToNum(account.nextOrderId),
  }
}

// ── Fetch helpers ───────────────────────────────────────────────────────────

const MULTI_BATCH = 100
/** Avoid getProgramAccounts when combo space fits in a few getMultipleAccounts. */
const MAX_ORDER_ENUM = 500

async function fetchMarketAccount(program) {
  const [pda] = marketPda()
  try {
    const account = await program.account.market.fetch(pda)
    return { publicKey: pda, account }
  } catch {
    return null
  }
}

/**
 * getMultipleAccounts by PDA — public free RPCs rate-limit getProgramAccounts
 * (Anchor `.all()`) aggressively, which made /bets return [] while accounts exist.
 */
async function fetchMultipleByKeys(accountClient, keys) {
  const out = []
  for (let i = 0; i < keys.length; i += MULTI_BATCH) {
    const chunk = keys.slice(i, i + MULTI_BATCH)
    const accounts = await accountClient.fetchMultiple(chunk)
    for (let j = 0; j < accounts.length; j++) {
      if (accounts[j]) out.push({ publicKey: chunk[j], account: accounts[j] })
    }
  }
  return out
}

async function listBetsByMarket(program, nextBetId) {
  const n = Number(nextBetId) || 0
  if (n <= 0) return []
  const keys = []
  for (let i = 0; i < n; i++) keys.push(betPda(i)[0])
  return fetchMultipleByKeys(program.account.bet, keys)
}

async function listOrdersByMarket(program, nextBetId, nextOrderId) {
  const nBets = Number(nextBetId) || 0
  const nOrders = Number(nextOrderId) || 0
  if (nBets <= 0 || nOrders <= 0) return []
  if (nBets * nOrders > MAX_ORDER_ENUM) {
    return program.account.order.all()
  }
  const keys = []
  for (let bid = 0; bid < nBets; bid++) {
    for (let oid = 0; oid < nOrders; oid++) {
      keys.push(orderPda(bid, oid)[0])
    }
  }
  return fetchMultipleByKeys(program.account.order, keys)
}

function isOpenOrder(account) {
  return (
    enumKey(account.status) === 'open' && bnToNum(account.qtyRemaining) > 0
  )
}

// ── Actions ─────────────────────────────────────────────────────────────────

export async function getBalance() {
  const connection = getConnection()
  const pk = getWalletPubkey()
  const lamports = await connection.getBalance(pk)
  return {
    pubkey: pk.toBase58(),
    balanceLamports: lamports,
    balanceSol: lamports / LAMPORTS_PER_SOL,
    cluster: getClusterLabel(process.env.RPC_URL || 'https://api.devnet.solana.com'),
  }
}

export async function getSnapshot() {
  const program = getProgram()
  const marketEntry = await fetchMarketAccount(program)
  if (!marketEntry) {
    return { market: null, bets: [], orders: [] }
  }

  const nextBetId = bnToNum(marketEntry.account.nextBetId)
  const nextOrderId = bnToNum(marketEntry.account.nextOrderId)

  const [betsSettled, ordersSettled] = await Promise.allSettled([
    listBetsByMarket(program, nextBetId),
    listOrdersByMarket(program, nextBetId, nextOrderId),
  ])

  if (betsSettled.status === 'rejected') {
    throw betsSettled.reason
  }
  if (ordersSettled.status === 'rejected') {
    // Orders are secondary; still return bets if orders fail
    console.error('[willohbets-api] listOrders failed:', ordersSettled.reason)
  }

  const bets = betsSettled.value
    .map((e) => serializeBet(e.publicKey, e.account))
    .sort((a, b) => b.betId - a.betId)

  const orders =
    ordersSettled.status === 'fulfilled'
      ? ordersSettled.value.map((e) => serializeOrder(e.publicKey, e.account))
      : []

  return {
    market: serializeMarket(marketEntry.publicKey, marketEntry.account),
    bets,
    orders,
  }
}

export async function getBets() {
  const { bets } = await getSnapshot()
  return bets
}

export async function getBet(betId) {
  const program = getProgram()
  const id = Number(betId)
  const [pda] = betPda(id)
  try {
    const account = await program.account.bet.fetch(pda)
    return serializeBet(pda, account)
  } catch {
    return null
  }
}

export async function getOpenOrders(betIdFilter) {
  const program = getProgram()
  const marketEntry = await fetchMarketAccount(program)
  if (!marketEntry) return []

  const nextBetId = bnToNum(marketEntry.account.nextBetId)
  const nextOrderId = bnToNum(marketEntry.account.nextOrderId)
  const all = await listOrdersByMarket(program, nextBetId, nextOrderId)
  let entries = all.filter((e) => isOpenOrder(e.account))
  if (betIdFilter != null && betIdFilter !== '') {
    const id = Number(betIdFilter)
    entries = entries.filter((e) => bnToNum(e.account.betId) === id)
  }
  return entries.map((e) => serializeOrder(e.publicKey, e.account))
}

export async function getPosition(betId) {
  const program = getProgram()
  const owner = getWalletPubkey()
  const id = Number(betId)
  const [pda] = positionPda(id, owner)
  try {
    const account = await program.account.position.fetch(pda)
    return serializePosition(pda, account)
  } catch {
    return null
  }
}

export async function placeOrder({ betId, side, priceBps, quantity }) {
  const program = getProgram()
  const owner = getWalletPubkey()
  const market = await fetchMarketAccount(program)
  if (!market) throw new Error('Market not initialized')

  const sideNorm = String(side).toLowerCase()
  if (sideNorm !== 'yes' && sideNorm !== 'no') {
    throw new Error('side must be "yes" or "no"')
  }
  const bps = Number(priceBps)
  if (!Number.isFinite(bps) || bps < MIN_PRICE_BPS || bps > MAX_PRICE_BPS) {
    throw new Error(
      `priceBps must be ${MIN_PRICE_BPS}-${MAX_PRICE_BPS} (1%–99%)`,
    )
  }
  const qty = Number(quantity)
  if (!Number.isFinite(qty) || qty < 1) {
    throw new Error('quantity must be >= 1')
  }

  const id = Number(betId)
  const orderId = bnToNum(market.account.nextOrderId)
  const [bet] = betPda(id)
  const [order] = orderPda(id, orderId)
  const [vault] = vaultPda()
  const sideArg = sideNorm === 'yes' ? { yes: {} } : { no: {} }

  const signature = await program.methods
    .placeOrder(new BN(id), sideArg, new BN(bps), new BN(qty))
    .accounts({
      owner,
      market: market.publicKey,
      bet,
      order,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return {
    signature,
    orderPubkey: order.toBase58(),
    orderId,
    betId: id,
    side: sideNorm,
    priceBps: bps,
    quantity: qty,
  }
}

export async function resolveOrderEntry({ orderPubkey, betId, orderId }) {
  const program = getProgram()
  if (orderPubkey) {
    const pk = new PublicKey(orderPubkey)
    const account = await program.account.order.fetch(pk)
    return { publicKey: pk, account }
  }
  if (betId == null || orderId == null) {
    throw new Error('Provide orderPubkey or (betId and orderId)')
  }
  const [pk] = orderPda(Number(betId), Number(orderId))
  const account = await program.account.order.fetch(pk)
  return { publicKey: pk, account }
}

export async function fillOrder({ orderPubkey, betId, orderId, quantity }) {
  const program = getProgram()
  const taker = getWalletPubkey()
  const market = await fetchMarketAccount(program)
  if (!market) throw new Error('Market not initialized')

  const qty = Number(quantity)
  if (!Number.isFinite(qty) || qty < 1) {
    throw new Error('quantity must be >= 1')
  }

  const orderEntry = await resolveOrderEntry({ orderPubkey, betId, orderId })
  const bid = bnToNum(orderEntry.account.betId)
  const [bet] = betPda(bid)
  const [vault] = vaultPda()
  const maker = orderEntry.account.owner
  const [makerPosition] = positionPda(bid, maker)
  const [takerPosition] = positionPda(bid, taker)

  const signature = await program.methods
    .fillOrder(new BN(qty))
    .accounts({
      taker,
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

  return {
    signature,
    orderPubkey: orderEntry.publicKey.toBase58(),
    betId: bid,
    quantity: qty,
  }
}

export async function cancelOrder({ orderPubkey, betId, orderId }) {
  const program = getProgram()
  const owner = getWalletPubkey()
  const orderEntry = await resolveOrderEntry({ orderPubkey, betId, orderId })
  const bid = bnToNum(orderEntry.account.betId)
  const [market] = marketPda()
  const [bet] = betPda(bid)
  const [vault] = vaultPda()

  const signature = await program.methods
    .cancelOrder()
    .accounts({
      owner,
      market,
      bet,
      order: orderEntry.publicKey,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return {
    signature,
    orderPubkey: orderEntry.publicKey.toBase58(),
    betId: bid,
  }
}

export async function claim(betId) {
  const program = getProgram()
  const owner = getWalletPubkey()
  const id = Number(betId)
  const [market] = marketPda()
  const [bet] = betPda(id)
  const [position] = positionPda(id, owner)
  const [vault] = vaultPda()

  const signature = await program.methods
    .claim()
    .accounts({
      owner,
      market,
      bet,
      position,
      vault,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return { signature, betId: id }
}

export async function createBet(name) {
  const program = getProgram()
  const creator = getWalletPubkey()
  const market = await fetchMarketAccount(program)
  if (!market) throw new Error('Market not initialized')

  const trimmed = String(name || '').trim()
  if (!trimmed) throw new Error('name is required')
  if (trimmed.length > 64) throw new Error('name max length is 64')

  const betId = bnToNum(market.account.nextBetId)
  const [bet] = betPda(betId)

  const signature = await program.methods
    .createBet(trimmed)
    .accounts({
      creator,
      market: market.publicKey,
      bet,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return {
    signature,
    betId,
    betPubkey: bet.toBase58(),
    name: trimmed,
  }
}

export async function settleBet(betId, outcome) {
  const program = getProgram()
  const settler = getWalletPubkey()
  const id = Number(betId)
  const out = String(outcome).toLowerCase()
  if (out !== 'yes' && out !== 'no' && out !== 'void') {
    throw new Error('outcome must be "yes", "no", or "void"')
  }
  const outcomeArg =
    out === 'yes' ? { yes: {} } : out === 'no' ? { no: {} } : { void: {} }

  const [market] = marketPda()
  const [bet] = betPda(id)

  const signature = await program.methods
    .settleBet(outcomeArg)
    .accounts({
      settler,
      market,
      bet,
    })
    .rpc()

  return { signature, betId: id, outcome: out }
}
