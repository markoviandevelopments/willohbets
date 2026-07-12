import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useConnection,
  useWallet,
  type AnchorWallet,
} from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import {
  CONTRACT_SOL,
  MODERATOR_PASSWORD,
  avgPricePercent,
  avgPriceSol,
  betIsOpen,
  cancelOrder,
  claim,
  createBet,
  escrowForOrder,
  fetchMarketSnapshot,
  fetchPosition,
  fillOrder,
  initializeMarket,
  invalidateMarketCache,
  isModeratorSession,
  markPositionAgainstBook,
  openOrdersForBet,
  outcomeLabel,
  placeOrder,
  setModeratorSession,
  settleBet,
  sideIsYes,
  takerCostSol,
  type BetEntry,
  type OrderBookEntry,
  type PositionAccount,
} from './market'
import { OrderBookDepth } from './OrderBookDepth'
import './App.css'

type Tab = 'trade' | 'history' | 'mod'

function short(pk: string) {
  return `${pk.slice(0, 4)}…${pk.slice(-4)}`
}

function formatAvg(
  cost: { toNumber(): number } | number,
  qty: { toNumber(): number } | number,
) {
  const pct = avgPricePercent(cost as never, qty as never)
  const sol = avgPriceSol(cost as never, qty as never)
  if (pct == null || sol == null) return 'avg —'
  return `avg ${pct.toFixed(1)}% (${sol.toFixed(6)} SOL)`
}

function fmtTime(ts: number) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString()
}

export default function App() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const aw = wallet as unknown as AnchorWallet

  const [tab, setTab] = useState<Tab>('trade')
  const [isMod, setIsMod] = useState(() => isModeratorSession())
  const [modPw, setModPw] = useState('')
  const [modError, setModError] = useState('')

  const [balance, setBalance] = useState<number | null>(null)
  const [marketReady, setMarketReady] = useState(false)
  const [bets, setBets] = useState<BetEntry[]>([])
  const [allOrders, setAllOrders] = useState<OrderBookEntry[]>([])
  const [selectedBetId, setSelectedBetId] = useState<number | null>(null)
  const [orders, setOrders] = useState<OrderBookEntry[]>([])
  const [position, setPosition] = useState<PositionAccount | null>(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const [newBetName, setNewBetName] = useState('')
  const [side, setSide] = useState<'yes' | 'no'>('yes')
  const [priceCents, setPriceCents] = useState(50)
  const [qty, setQty] = useState(1)
  const [fillQty, setFillQty] = useState<Record<string, number>>({})

  const selectedBetIdRef = useRef(selectedBetId)
  selectedBetIdRef.current = selectedBetId

  const openBets = useMemo(() => bets.filter((b) => betIsOpen(b.account)), [bets])
  const selected = useMemo(
    () => bets.find((b) => b.account.betId.toNumber() === selectedBetId) ?? null,
    [bets, selectedBetId],
  )

  const refresh = useCallback(
    async (opts?: { force?: boolean }) => {
      try {
        // Parallel: balance (if wallet) + market snapshot (bets+orders together)
        const walletPk = wallet.publicKey
        const [balResult, snap] = await Promise.all([
          walletPk
            ? connection.getBalance(walletPk)
            : Promise.resolve(null as number | null),
          fetchMarketSnapshot(connection, {
            force: opts?.force,
            wallet: wallet.signTransaction ? aw : null,
          }),
        ])

        if (balResult != null) setBalance(balResult / LAMPORTS_PER_SOL)
        else setBalance(null)

        setMarketReady(!!snap.market)
        setBets(snap.bets)
        setAllOrders(snap.orders)

        if (!snap.market) {
          setOrders([])
          setPosition(null)
          return
        }

        const current = selectedBetIdRef.current
        const preferred =
          current != null &&
          snap.bets.some((b) => b.account.betId.toNumber() === current)
            ? current
            : snap.bets.find((b) => betIsOpen(b.account))?.account.betId
                .toNumber() ??
              snap.bets[0]?.account.betId.toNumber() ??
              null

        if (preferred !== selectedBetIdRef.current) {
          setSelectedBetId(preferred)
        }

        const betId = preferred
        if (betId != null) {
          setOrders(openOrdersForBet(snap.orders, betId))
          if (walletPk) {
            const p = await fetchPosition(connection, aw, betId, walletPk)
            setPosition(p?.account ?? null)
          } else {
            setPosition(null)
          }
        } else {
          setOrders([])
          setPosition(null)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [connection, wallet.publicKey, wallet.signTransaction, aw],
  )

  useEffect(() => {
    void refresh()
    const t = setInterval(() => void refresh(), 12_000)
    return () => clearInterval(t)
  }, [refresh])

  // When user picks another bet, filter orders locally (instant) then fetch position
  useEffect(() => {
    if (selectedBetId == null) {
      setOrders([])
      setPosition(null)
      return
    }
    setOrders(openOrdersForBet(allOrders, selectedBetId))
    if (!wallet.publicKey) {
      setPosition(null)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const p = await fetchPosition(
          connection,
          aw,
          selectedBetId,
          wallet.publicKey!,
        )
        if (!cancelled) setPosition(p?.account ?? null)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedBetId, allOrders, connection, aw, wallet.publicKey])

  const run = async (label: string, fn: () => Promise<string>) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setStatus('Connect a wallet first.')
      return
    }
    setBusy(true)
    setStatus(label)
    try {
      const sig = await fn()
      setStatus(`${label} ✓ ${short(sig)}`)
      invalidateMarketCache()
      await refresh({ force: true })
    } catch (e: unknown) {
      setStatus(`Failed: ${e instanceof Error ? e.message : String(e)}`)
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const loginMod = (e: React.FormEvent) => {
    e.preventDefault()
    if (modPw === MODERATOR_PASSWORD) {
      setModeratorSession(true)
      setIsMod(true)
      setModError('')
      setModPw('')
      setTab('mod')
    } else {
      setModError('Incorrect password')
    }
  }

  const logoutMod = () => {
    setModeratorSession(false)
    setIsMod(false)
    if (tab === 'mod') setTab('trade')
  }

  const priceBps = Math.round(priceCents * 100)
  const escrowEst = escrowForOrder(priceBps, qty)
  const tradingOpen = selected && betIsOpen(selected.account)

  const yesBids = useMemo(
    () =>
      orders
        .filter((o) => sideIsYes(o.account.side))
        .sort(
          (a, b) =>
            b.account.priceBps.toNumber() - a.account.priceBps.toNumber(),
        ),
    [orders],
  )
  const noBids = useMemo(
    () =>
      orders
        .filter((o) => !sideIsYes(o.account.side))
        .sort(
          (a, b) =>
            b.account.priceBps.toNumber() - a.account.priceBps.toNumber(),
        ),
    [orders],
  )

  const positionMark = useMemo(
    () => markPositionAgainstBook(position, yesBids, noBids),
    [position, yesBids, noBids],
  )

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>WillohBets</h1>
          <p className="tagline">
            Devnet prediction markets · 1 contract = {CONTRACT_SOL} SOL
          </p>
        </div>
        <div className="header-right">
          {isMod && <span className="mod-badge">Moderator</span>}
          <WalletMultiButton />
        </div>
      </header>

      <nav className="tabs">
        <button
          className={tab === 'trade' ? 'active' : ''}
          onClick={() => setTab('trade')}
          type="button"
        >
          Trade
        </button>
        <button
          className={tab === 'history' ? 'active' : ''}
          onClick={() => setTab('history')}
          type="button"
        >
          History
        </button>
        <button
          className={tab === 'mod' ? 'active' : ''}
          onClick={() => setTab('mod')}
          type="button"
        >
          Moderator
        </button>
      </nav>

      <main className="main">
        {tab === 'mod' && !isMod && (
          <section className="card mod-login">
            <h2>Moderator login</h2>
            <p className="muted">
              Enter the moderator password to create and resolve bets. Trading
              still uses your connected wallet.
            </p>
            <form onSubmit={loginMod} className="mod-form">
              <input
                type="password"
                placeholder="Password"
                value={modPw}
                onChange={(e) => setModPw(e.target.value)}
                autoComplete="current-password"
              />
              <button className="primary" type="submit">
                Log in
              </button>
            </form>
            {modError && <p className="error">{modError}</p>}
          </section>
        )}

        {tab === 'mod' && isMod && (
          <section className="card">
            <div className="row">
              <h2>Moderator panel</h2>
              <button className="ghost" type="button" onClick={logoutMod}>
                Log out
              </button>
            </div>

            {!marketReady && (
              <div className="block">
                <p className="muted">
                  First-time setup: initialize the on-chain market (once).
                </p>
                <button
                  className="primary"
                  disabled={!wallet.connected || busy}
                  onClick={() =>
                    void run('Initialize market…', () =>
                      initializeMarket(connection, aw),
                    )
                  }
                >
                  Initialize market
                </button>
              </div>
            )}

            {marketReady && (
              <>
                <div className="block">
                  <h3>Create a bet</h3>
                  <p className="muted small">
                    Name the market (YES vs NO). Users can then trade limit
                    orders against it.
                  </p>
                  <div className="inline-form">
                    <input
                      type="text"
                      maxLength={64}
                      placeholder='e.g. "Will it rain in Austin on Friday?"'
                      value={newBetName}
                      onChange={(e) => setNewBetName(e.target.value)}
                    />
                    <button
                      className="primary"
                      disabled={!wallet.connected || busy || !newBetName.trim()}
                      onClick={() =>
                        void run('Creating bet…', async () => {
                          const sig = await createBet(
                            connection,
                            aw,
                            newBetName.trim(),
                          )
                          setNewBetName('')
                          return sig
                        })
                      }
                    >
                      Create bet
                    </button>
                  </div>
                </div>

                <div className="block">
                  <h3>Resolve open bets</h3>
                  {openBets.length === 0 && (
                    <p className="muted">No open bets.</p>
                  )}
                  <ul className="resolve-list">
                    {openBets.map((b) => {
                      const id = b.account.betId.toNumber()
                      return (
                        <li key={b.publicKey.toBase58()}>
                          <div>
                            <strong>#{id}</strong> {b.account.name}
                            <div className="muted small">
                              created {fmtTime(b.account.createdTs.toNumber())}
                            </div>
                          </div>
                          <div className="resolve-actions">
                            <button
                              className="yes-btn"
                              disabled={!wallet.connected || busy}
                              onClick={() =>
                                void run(`Settle #${id} YES…`, () =>
                                  settleBet(connection, aw, id, 'yes'),
                                )
                              }
                            >
                              YES
                            </button>
                            <button
                              className="no-btn"
                              disabled={!wallet.connected || busy}
                              onClick={() =>
                                void run(`Settle #${id} NO…`, () =>
                                  settleBet(connection, aw, id, 'no'),
                                )
                              }
                            >
                              NO
                            </button>
                            <button
                              className="ghost"
                              disabled={!wallet.connected || busy}
                              onClick={() =>
                                void run(`Void #${id}…`, () =>
                                  settleBet(connection, aw, id, 'void'),
                                )
                              }
                            >
                              Void
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </>
            )}
          </section>
        )}

        {tab === 'history' && (
          <section className="card">
            <div className="row">
              <h2>Bet history</h2>
              <button
                className="ghost"
                type="button"
                disabled={busy || loading}
                onClick={() => void refresh({ force: true })}
              >
                Refresh
              </button>
            </div>
            {loading && <p className="muted">Loading bets…</p>}
            {!loading && bets.length === 0 && (
              <p className="muted">No bets yet.</p>
            )}
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Outcome</th>
                  <th>Created</th>
                  <th>Settled</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {bets.map((b) => {
                  const id = b.account.betId.toNumber()
                  const open = betIsOpen(b.account)
                  return (
                    <tr key={b.publicKey.toBase58()}>
                      <td>#{id}</td>
                      <td>{b.account.name}</td>
                      <td>
                        <span className={open ? 'pill open' : 'pill settled'}>
                          {open ? 'Open' : 'Settled'}
                        </span>
                      </td>
                      <td>{open ? '—' : outcomeLabel(b.account.outcome)}</td>
                      <td className="muted small">
                        {fmtTime(b.account.createdTs.toNumber())}
                      </td>
                      <td className="muted small">
                        {open ? '—' : fmtTime(b.account.settledTs.toNumber())}
                      </td>
                      <td>
                        <button
                          className="ghost"
                          type="button"
                          onClick={() => {
                            setSelectedBetId(id)
                            setTab('trade')
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        )}

        {tab === 'trade' && (
          <>
            <section className="card hero">
              <div className="stats">
                <div>
                  <span className="label">Network</span>
                  <strong>Solana Devnet</strong>
                </div>
                <div>
                  <span className="label">Contract size</span>
                  <strong>{CONTRACT_SOL} SOL</strong>
                </div>
                <div>
                  <span className="label">Your balance</span>
                  <strong>
                    {balance == null ? '—' : `${balance.toFixed(4)} SOL`}
                  </strong>
                </div>
                <div>
                  <span className="label">Open markets</span>
                  <strong>{openBets.length}</strong>
                </div>
              </div>

              <label className="field">
                <span>Select market</span>
                <select
                  value={selectedBetId ?? ''}
                  disabled={loading}
                  onChange={(e) =>
                    setSelectedBetId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                >
                  <option value="">
                    {loading ? 'Loading markets…' : '— pick a bet —'}
                  </option>
                  {bets.map((b) => {
                    const id = b.account.betId.toNumber()
                    const open = betIsOpen(b.account)
                    return (
                      <option key={id} value={id}>
                        #{id} {b.account.name}
                        {open ? '' : ` [${outcomeLabel(b.account.outcome)}]`}
                      </option>
                    )
                  })}
                </select>
              </label>

              {loading && (
                <p className="muted load-hint">Fetching on-chain markets…</p>
              )}

              {selected && (
                <div className="question">
                  <span className={tradingOpen ? 'pill open' : 'pill settled'}>
                    {tradingOpen ? 'Open' : 'Settled'}
                  </span>{' '}
                  <strong>#{selected.account.betId.toString()}</strong>{' '}
                  {selected.account.name}
                  {!tradingOpen && (
                    <span className="outcome-inline">
                      {' '}
                      → {outcomeLabel(selected.account.outcome)}
                    </span>
                  )}
                </div>
              )}

              {!marketReady && wallet.connected && (
                <p className="muted">
                  Market not initialized yet — a moderator must set it up first.
                </p>
              )}
            </section>

            {selected && (
              <div className="grid-2">
                <section className="card">
                  <h2>Place limit order</h2>
                  <p className="muted small">
                    Bid YES or NO at a % of the {CONTRACT_SOL} SOL payout.
                    Others can take the opposite side.
                  </p>
                  <div className="side-toggle">
                    <button
                      type="button"
                      className={side === 'yes' ? 'on yes' : ''}
                      onClick={() => setSide('yes')}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      className={side === 'no' ? 'on no' : ''}
                      onClick={() => setSide('no')}
                    >
                      NO
                    </button>
                  </div>
                  <label className="field">
                    <span>Limit price (% of payout)</span>
                    <input
                      type="range"
                      min={1}
                      max={99}
                      value={priceCents}
                      onChange={(e) => setPriceCents(Number(e.target.value))}
                    />
                    <strong>
                      {priceCents}% ≈{' '}
                      {((priceCents / 100) * CONTRACT_SOL).toFixed(5)} SOL /
                      contract
                    </strong>
                  </label>
                  <label className="field">
                    <span>Quantity</span>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(1, Number(e.target.value) || 1))
                      }
                    />
                  </label>
                  <p className="muted">
                    Escrow ≈ <strong>{escrowEst.toFixed(6)} SOL</strong>
                  </p>
                  <button
                    className="primary"
                    disabled={!wallet.connected || busy || !tradingOpen}
                    onClick={() =>
                      void run('Placing order…', () =>
                        placeOrder(
                          connection,
                          aw,
                          selected.account.betId.toNumber(),
                          side,
                          priceBps,
                          qty,
                        ),
                      )
                    }
                  >
                    Place {side.toUpperCase()} × {qty}
                  </button>
                </section>

                <section className="card">
                  <h2>Your position</h2>
                  {position ? (
                    <>
                      <ul className="pos">
                        <li>
                          <div className="pos-row">
                            <span>
                              YES:{' '}
                              <strong>
                                {position.yesContracts.toString()}
                              </strong>
                            </span>
                            <span className="muted small">
                              {formatAvg(
                                position.yesCostLamports,
                                position.yesContracts,
                              )}
                            </span>
                          </div>
                        </li>
                        <li>
                          <div className="pos-row">
                            <span>
                              NO:{' '}
                              <strong>
                                {position.noContracts.toString()}
                              </strong>
                            </span>
                            <span className="muted small">
                              {formatAvg(
                                position.noCostLamports,
                                position.noContracts,
                              )}
                            </span>
                          </div>
                        </li>
                        <li>
                          Claimed:{' '}
                          <strong>{position.claimed ? 'yes' : 'no'}</strong>
                        </li>
                      </ul>
                      {positionMark && (
                        <div className="mark-box">
                          <div className="pos-row">
                            <span className="muted small">Total paid</span>
                            <strong>
                              {positionMark.totalPaidSol.toFixed(6)} SOL
                            </strong>
                          </div>
                          <div className="pos-row">
                            <span className="muted small">
                              Market value (book)
                            </span>
                            <strong
                              className={
                                positionMark.marketValueSol >=
                                positionMark.totalPaidSol
                                  ? 'up'
                                  : 'down'
                              }
                            >
                              {positionMark.marketValueSol.toFixed(6)} SOL
                            </strong>
                          </div>
                          <div className="pos-row">
                            <span className="muted small">Unrealized PnL</span>
                            <strong
                              className={
                                positionMark.unrealizedPnlSol >= 0
                                  ? 'up'
                                  : 'down'
                              }
                            >
                              {positionMark.unrealizedPnlSol >= 0 ? '+' : ''}
                              {positionMark.unrealizedPnlSol.toFixed(6)} SOL
                            </strong>
                          </div>
                          <div className="pos-row mark-detail">
                            <span className="muted small">
                              Hedged YES {positionMark.yesCovered}/
                              {position.yesContracts.toString()} · NO{' '}
                              {positionMark.noCovered}/
                              {position.noContracts.toString()}
                            </span>
                          </div>
                          <p className="muted small mark-note">
                            {positionMark.note}. Hedge uses opposite fills on
                            resting bids (pay complement). Residual is
                            mark-to-bid on leftover same-side depth.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="muted">No matched position on this bet.</p>
                  )}
                  {position &&
                    selected &&
                    !betIsOpen(selected.account) &&
                    !position.claimed &&
                    (position.yesContracts.toNumber() > 0 ||
                      position.noContracts.toNumber() > 0) && (
                      <button
                        className="secondary"
                        disabled={!wallet.connected || busy}
                        onClick={() =>
                          void run('Claiming…', () =>
                            claim(
                              connection,
                              aw,
                              selected.account.betId.toNumber(),
                            ),
                          )
                        }
                      >
                        Claim winnings
                      </button>
                    )}
                </section>
              </div>
            )}

            {selected && (
              <section className="card">
                <div className="row">
                  <h2>Order book</h2>
                  <button
                    className="ghost"
                    type="button"
                    disabled={busy || loading}
                    onClick={() => void refresh({ force: true })}
                  >
                    Refresh
                  </button>
                </div>
                <OrderBookDepth yesBids={yesBids} noBids={noBids} />
                <div className="book">
                  <div>
                    <h3 className="yes">YES bids</h3>
                    <BookTable
                      rows={yesBids}
                      walletPk={wallet.publicKey?.toBase58()}
                      fillQty={fillQty}
                      setFillQty={setFillQty}
                      busy={busy || !tradingOpen}
                      onFill={(o, q) =>
                        void run('Taking order…', () =>
                          fillOrder(connection, aw, o, q),
                        )
                      }
                      onCancel={(o) =>
                        void run('Cancelling…', () =>
                          cancelOrder(connection, aw, o),
                        )
                      }
                    />
                  </div>
                  <div>
                    <h3 className="no">NO bids</h3>
                    <BookTable
                      rows={noBids}
                      walletPk={wallet.publicKey?.toBase58()}
                      fillQty={fillQty}
                      setFillQty={setFillQty}
                      busy={busy || !tradingOpen}
                      onFill={(o, q) =>
                        void run('Taking order…', () =>
                          fillOrder(connection, aw, o, q),
                        )
                      }
                      onCancel={(o) =>
                        void run('Cancelling…', () =>
                          cancelOrder(connection, aw, o),
                        )
                      }
                    />
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {status && (
          <section className="card result">
            <p className="mono">{status}</p>
          </section>
        )}

        <section className="card" style={{ opacity: 0.85 }}>
          <p className="muted small" style={{ margin: 0 }}>
            Agent API (no browser wallet):{' '}
            <a
              href={`${import.meta.env.VITE_API_URL || 'https://willohbetsapi.immenseaccumulationonline.online'}/openapi.json`}
              target="_blank"
              rel="noreferrer"
            >
              OpenAPI
            </a>
            {' · '}
            <a
              href={`${import.meta.env.VITE_API_URL || 'https://willohbetsapi.immenseaccumulationonline.online'}/health`}
              target="_blank"
              rel="noreferrer"
            >
              health
            </a>
            {' · '}
            <a
              href="https://github.com/markoviandevelopments/willohbets/blob/main/docs/AGENT_API.md"
              target="_blank"
              rel="noreferrer"
            >
              docs
            </a>
            <br />
            <span className="mono" style={{ fontSize: '0.8em' }}>
              {import.meta.env.VITE_API_URL ||
                'https://willohbetsapi.immenseaccumulationonline.online'}
            </span>
          </p>
        </section>
      </main>
    </div>
  )
}

function BookTable({
  rows,
  walletPk,
  fillQty,
  setFillQty,
  busy,
  onFill,
  onCancel,
}: {
  rows: OrderBookEntry[]
  walletPk?: string
  fillQty: Record<string, number>
  setFillQty: (v: Record<string, number>) => void
  busy: boolean
  onFill: (o: OrderBookEntry, q: number) => void
  onCancel: (o: OrderBookEntry) => void
}) {
  if (rows.length === 0) {
    return <p className="muted small">No resting orders</p>
  }
  return (
    <table className="book-table">
      <thead>
        <tr>
          <th>Price</th>
          <th>Qty</th>
          <th>Owner</th>
          <th>Take cost</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((o) => {
          const key = o.publicKey.toBase58()
          const price = o.account.priceBps.toNumber()
          const rem = o.account.qtyRemaining.toNumber()
          const q = fillQty[key] ?? Math.min(1, rem)
          const mine = walletPk === o.account.owner.toBase58()
          return (
            <tr key={key}>
              <td>{(price / 100).toFixed(1)}%</td>
              <td>{rem}</td>
              <td className="mono">{short(o.account.owner.toBase58())}</td>
              <td className="muted small">
                {takerCostSol(price, q).toFixed(6)} SOL
              </td>
              <td className="ops">
                {mine ? (
                  <button
                    className="ghost"
                    disabled={busy}
                    onClick={() => onCancel(o)}
                  >
                    Cancel
                  </button>
                ) : (
                  <>
                    <input
                      type="number"
                      min={1}
                      max={rem}
                      value={q}
                      onChange={(e) =>
                        setFillQty({
                          ...fillQty,
                          [key]: Math.min(
                            rem,
                            Math.max(1, Number(e.target.value) || 1),
                          ),
                        })
                      }
                    />
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() => onFill(o, q)}
                    >
                      Take
                    </button>
                  </>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
