import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { buildDepth, type OrderBookEntry } from './market'

type Props = {
  yesBids: OrderBookEntry[]
  noBids: OrderBookEntry[]
}

type ChartRow = {
  priceLabel: string
  pricePct: number
  yesQty: number
  noQty: number
  yesCum: number
  noCum: number
}

export function OrderBookDepth({ yesBids, noBids }: Props) {
  const yesDepth = useMemo(() => buildDepth(yesBids, 'yes'), [yesBids])
  const noDepth = useMemo(() => buildDepth(noBids, 'no'), [noBids])

  const chartData = useMemo(() => {
    const prices = new Set<number>()
    for (const l of yesDepth) prices.add(l.pricePct)
    for (const l of noDepth) prices.add(l.pricePct)
    const sorted = [...prices].sort((a, b) => a - b)

    const yesMap = new Map(yesDepth.map((l) => [l.pricePct, l]))
    const noMap = new Map(noDepth.map((l) => [l.pricePct, l]))

    return sorted.map((pricePct): ChartRow => {
      const y = yesMap.get(pricePct)
      const n = noMap.get(pricePct)
      return {
        priceLabel: `${pricePct.toFixed(0)}%`,
        pricePct,
        yesQty: y?.qty ?? 0,
        noQty: n?.qty ?? 0,
        yesCum: y?.cumulative ?? 0,
        noCum: n?.cumulative ?? 0,
      }
    })
  }, [yesDepth, noDepth])

  const maxQty = useMemo(() => {
    let m = 1
    for (const r of chartData) {
      m = Math.max(m, r.yesQty, r.noQty)
    }
    return m
  }, [chartData])

  const midHint = useMemo(() => {
    const bestYes = yesDepth[0]?.pricePct
    const bestNo = noDepth[0]?.pricePct
    if (bestYes != null && bestNo != null) {
      // Implied fair YES ≈ midpoint of best YES bid and (100 - best NO bid)
      return (bestYes + (100 - bestNo)) / 2
    }
    if (bestYes != null) return bestYes
    if (bestNo != null) return 100 - bestNo
    return 50
  }, [yesDepth, noDepth])

  if (chartData.length === 0) {
    return (
      <p className="muted small depth-empty">
        No depth to chart — place or wait for limit orders.
      </p>
    )
  }

  return (
    <div className="depth-panel">
      <div className="depth-header">
        <h3 className="depth-title">Depth by price</h3>
        <span className="muted small">
          Bars = size at price · dashed line ≈ implied mid (
          {midHint.toFixed(1)}% YES)
        </span>
      </div>
      <div className="depth-chart">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="priceLabel"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{
                value: 'Limit price (% of payout)',
                position: 'insideBottom',
                offset: -2,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              allowDecimals={false}
              domain={[0, Math.ceil(maxQty * 1.15)]}
              label={{
                value: 'Contracts',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                background: '#121a2f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                const label =
                  name === 'yesQty' ? 'YES size' : name === 'noQty' ? 'NO size' : String(name)
                return [value, label]
              }}
              labelFormatter={(label) => `Price ${label}`}
            />
            <ReferenceLine
              x={`${Math.round(midHint)}%`}
              stroke="#fbbf24"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            <Bar dataKey="yesQty" name="yesQty" radius={[4, 4, 0, 0]}>
              {chartData.map((row) => (
                <Cell
                  key={`y-${row.pricePct}`}
                  fill="rgba(20, 241, 149, 0.85)"
                />
              ))}
            </Bar>
            <Bar dataKey="noQty" name="noQty" radius={[4, 4, 0, 0]}>
              {chartData.map((row) => (
                <Cell
                  key={`n-${row.pricePct}`}
                  fill="rgba(244, 63, 94, 0.85)"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Horizontal cumulative ladder */}
      <div className="depth-ladder">
        <div className="ladder-col">
          <div className="ladder-head yes">YES cumulative</div>
          {yesDepth.length === 0 && (
            <p className="muted small">—</p>
          )}
          {yesDepth.map((l) => (
            <div key={`yc-${l.priceBps}`} className="ladder-row">
              <span className="ladder-price">{l.pricePct.toFixed(0)}%</span>
              <div className="ladder-bar-track">
                <div
                  className="ladder-bar yes"
                  style={{
                    width: `${Math.min(100, (l.cumulative / (yesDepth[yesDepth.length - 1]?.cumulative || 1)) * 100)}%`,
                  }}
                />
              </div>
              <span className="ladder-qty">
                {l.qty} <span className="muted">(Σ{l.cumulative})</span>
              </span>
            </div>
          ))}
        </div>
        <div className="ladder-col">
          <div className="ladder-head no">NO cumulative</div>
          {noDepth.length === 0 && (
            <p className="muted small">—</p>
          )}
          {noDepth.map((l) => (
            <div key={`nc-${l.priceBps}`} className="ladder-row">
              <span className="ladder-price">{l.pricePct.toFixed(0)}%</span>
              <div className="ladder-bar-track">
                <div
                  className="ladder-bar no"
                  style={{
                    width: `${Math.min(100, (l.cumulative / (noDepth[noDepth.length - 1]?.cumulative || 1)) * 100)}%`,
                  }}
                />
              </div>
              <span className="ladder-qty">
                {l.qty} <span className="muted">(Σ{l.cumulative})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
