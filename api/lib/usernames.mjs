/**
 * Persistent username registry for WillohBets wallets.
 * File: api/data/usernames.json
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
} from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { PublicKey } from '@solana/web3.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const DATA_FILE = join(DATA_DIR, 'usernames.json')

/** @typedef {{ wallet: string, username: string, updatedAt: string, updatedBy?: string }} UsernameEntry */

function emptyStore() {
  return {
    version: 1,
    /** @type {Record<string, UsernameEntry>} wallet -> entry */
    byWallet: {},
    /** @type {Record<string, number>} wallet -> last seen unix ms */
    visits: {},
  }
}

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(emptyStore(), null, 2))
  }
}

function load() {
  ensureStore()
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, 'utf8'))
    return {
      version: 1,
      byWallet: raw.byWallet || {},
      visits: raw.visits || {},
    }
  } catch {
    return emptyStore()
  }
}

function save(store) {
  ensureStore()
  const tmp = DATA_FILE + '.tmp'
  writeFileSync(tmp, JSON.stringify(store, null, 2))
  renameSync(tmp, DATA_FILE)
}

export function normalizeWallet(wallet) {
  try {
    return new PublicKey(String(wallet).trim()).toBase58()
  } catch {
    throw new Error('Invalid Solana wallet address')
  }
}

export function validateUsername(name) {
  const u = String(name || '').trim()
  if (u.length < 2 || u.length > 24) {
    throw new Error('Username must be 2–24 characters')
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(u)) {
    throw new Error(
      'Username: letters, numbers, _ or - only; must start with alphanumeric',
    )
  }
  return u
}

/** Public directory: only wallets that have a username. */
export function listUsernames() {
  const store = load()
  const entries = Object.values(store.byWallet).sort((a, b) =>
    a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }),
  )
  const map = {}
  for (const e of entries) map[e.wallet] = e.username
  return { entries, map }
}

export function getUsername(wallet) {
  const w = normalizeWallet(wallet)
  return load().byWallet[w]?.username ?? null
}

/**
 * Assign or update username for a wallet. Username unique (case-insensitive).
 * Pass empty username to clear.
 */
export function setUsername(wallet, username, updatedBy = 'moderator') {
  const w = normalizeWallet(wallet)
  const store = load()

  if (!username || !String(username).trim()) {
    delete store.byWallet[w]
    save(store)
    return { wallet: w, username: null, cleared: true }
  }

  const u = validateUsername(username)
  const lower = u.toLowerCase()
  for (const [otherW, e] of Object.entries(store.byWallet)) {
    if (otherW !== w && e.username.toLowerCase() === lower) {
      throw new Error(`Username "${u}" is already taken by ${otherW}`)
    }
  }

  store.byWallet[w] = {
    wallet: w,
    username: u,
    updatedAt: new Date().toISOString(),
    updatedBy,
  }
  // Seeing them in mod assignment counts as activity
  store.visits[w] = Date.now()
  save(store)
  return { ...store.byWallet[w], cleared: false }
}

/** Record that a wallet interacted with the site (connect / trade). */
export function recordVisit(wallet) {
  const w = normalizeWallet(wallet)
  const store = load()
  store.visits[w] = Date.now()
  save(store)
  return {
    wallet: w,
    lastSeen: store.visits[w],
    username: store.byWallet[w]?.username ?? null,
  }
}

/**
 * Merge on-chain active wallets with visit log and named wallets.
 * @param {string[]} onChainWallets
 */
export function listActiveWallets(onChainWallets = []) {
  const store = load()
  const set = new Set()
  for (const w of onChainWallets) {
    try {
      set.add(normalizeWallet(w))
    } catch {
      /* skip */
    }
  }
  for (const w of Object.keys(store.visits)) set.add(w)
  for (const w of Object.keys(store.byWallet)) set.add(w)

  const wallets = [...set].map((wallet) => ({
    wallet,
    username: store.byWallet[wallet]?.username ?? null,
    lastSeen: store.visits[wallet] ?? null,
    named: !!store.byWallet[wallet],
  }))

  wallets.sort((a, b) => {
    // Named first, then by lastSeen desc, then wallet
    if (a.named !== b.named) return a.named ? -1 : 1
    const ta = a.lastSeen || 0
    const tb = b.lastSeen || 0
    if (ta !== tb) return tb - ta
    return a.wallet.localeCompare(b.wallet)
  })

  return wallets
}
