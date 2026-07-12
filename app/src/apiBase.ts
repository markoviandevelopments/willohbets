/** Public Agent API (Cloudflare → localhost:5180). */
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://willohbetsapi.immenseaccumulationonline.online'

export type UsernameEntry = {
  wallet: string
  username: string
  updatedAt?: string
  updatedBy?: string
}

export type ActiveWallet = {
  wallet: string
  username: string | null
  lastSeen: number | null
  named: boolean
}

export async function fetchUsernames(): Promise<{
  map: Record<string, string>
  entries: UsernameEntry[]
}> {
  const r = await fetch(`${API_BASE}/usernames`)
  if (!r.ok) throw new Error(`usernames HTTP ${r.status}`)
  const j = (await r.json()) as {
    ok?: boolean
    map?: Record<string, string>
    entries?: UsernameEntry[]
  }
  return {
    map: j.map || {},
    entries: j.entries || [],
  }
}

export async function fetchActiveWallets(): Promise<ActiveWallet[]> {
  const r = await fetch(`${API_BASE}/wallets/active`)
  if (!r.ok) throw new Error(`active wallets HTTP ${r.status}`)
  const j = (await r.json()) as { ok?: boolean; wallets?: ActiveWallet[] }
  return j.wallets || []
}

export async function assignUsername(
  wallet: string,
  username: string,
  modPassword: string,
): Promise<void> {
  const r = await fetch(`${API_BASE}/usernames`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Moderator-Password': modPassword,
    },
    body: JSON.stringify({ wallet, username }),
  })
  const j = (await r.json()) as { ok?: boolean; error?: string }
  if (!r.ok || j.ok === false) {
    throw new Error(j.error || `HTTP ${r.status}`)
  }
}

export async function recordWalletVisit(wallet: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet }),
    })
  } catch {
    /* non-fatal */
  }
}

export function displayName(
  wallet: string | { toBase58(): string },
  map: Record<string, string>,
): string {
  const pk = typeof wallet === 'string' ? wallet : wallet.toBase58()
  if (map[pk]) return map[pk]
  return `${pk.slice(0, 4)}…${pk.slice(-4)}`
}
