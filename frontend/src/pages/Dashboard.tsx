import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Cell,
} from 'recharts'
import { analyzeCSV } from '../services/api'
import type { AnalysisResponse, Recommendation } from '../types/api-types'
import {
  Spinner, Badge, Card, SectionTitle, StatTile,
  ErrorBanner, ScoreBar, FileDropZone,
} from '../components/ui'

const CATEGORY_ICON: Record<string, string> = {
  budget: '💰', audience: '👥', creative: '🎨', bidding: '⚡', targeting: '🎯',
}

function fmt(n: number, prefix = '') {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${prefix}${(n / 1_000).toFixed(1)}K`
  return `${prefix}${n.toFixed(2)}`
}

function RecommendationCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const [open, setOpen] = useState(false)
  return (
    <Card className="cursor-pointer hover:border-zinc-700 transition-colors" >
      <div className="flex items-start gap-3" onClick={() => setOpen(!open)}>
        <span className="text-xl">{CATEGORY_ICON[rec.category]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-white truncate">{rec.title}</p>
            <div className="flex items-center gap-2 shrink-0">
              <Badge label={rec.category} />
              <span className="text-xs font-bold text-emerald-400">{rec.impact_score}/10</span>
            </div>
          </div>
          <ScoreBar score={rec.impact_score} />
        </div>
      </div>
      {open && (
        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
          <p className="text-sm text-zinc-300">{rec.description}</p>
          <div className="flex items-start gap-2 mt-3 bg-zinc-800/60 rounded-lg px-3 py-2">
            <span className="text-emerald-400 text-xs font-bold mt-0.5">ACTION</span>
            <p className="text-sm text-zinc-200">{rec.action}</p>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function DashboardPage() {
  const [file, setFile]               = useState<File | null>(null)
  const [aov, setAov]                 = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [data, setData]               = useState<AnalysisResponse | null>(null)
  const [demoLoading, setDemoLoading] = useState(false)

  async function handleAnalyze() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeCSV(file, aov ? Number(aov) : undefined)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Demo mode — loads sample data without needing a real file
  async function handleDemo() {
    setDemoLoading(true)
    setError(null)
    try {
      const csv = [
        'Campaign name,Impressions,Clicks (all),Amount spent (EUR),Results',
        'Black Friday - Prospecting,312400,6820,9840.50,142',
        'Black Friday - Retargeting,48200,3910,4120.00,198',
        'Spring Collection - Lookalike,185600,2740,3980.00,38',
        'Brand Awareness - Video,520000,4100,2980.00,0',
        'Dynamic Product Ads,62300,5480,3740.00,231',
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const demoFile = new File([blob], 'demo_meta.csv', { type: 'text/csv' })
      setFile(demoFile)
      const result = await analyzeCSV(demoFile, 80)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Demo failed — is the backend running?')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload card */}
      <Card>
        <SectionTitle>Upload campaign export</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FileDropZone
              accept=".csv"
              label="Drop Meta or Google Ads CSV"
              hint="Exported from Ads Manager · max 10 MB"
              onFile={setFile}
              file={file}
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">
                Avg. order value (EUR) <span className="text-zinc-600">optional</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 80"
                value={aov}
                onChange={(e) => setAov(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-zinc-600 mt-1">Used to compute ROAS when not in CSV</p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner className="w-4 h-4" /> Analysing…</> : 'Analyse'}
            </button>
            <button
              onClick={handleDemo}
              disabled={demoLoading || loading}
              className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 text-sm rounded-lg py-2 transition-colors"
            >
              {demoLoading ? 'Loading demo…' : 'Try demo'}
            </button>
          </div>
        </div>
        {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
      </Card>

      {data && (
        <>
          {/* KPI row */}
          <div>
            <SectionTitle>Account overview · {data.platform}</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Total spend"      value={`€${fmt(data.total_spend)}`} />
              <StatTile label="Conversions"       value={String(data.total_conversions)} />
              <StatTile label="Avg CTR"           value={`${data.avg_ctr}%`} />
              <StatTile label="Avg CPC"           value={`€${data.avg_cpc}`} />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <SectionTitle>Spend by campaign</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.charts.spend_by_campaign} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(v) => `€${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} width={130} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(v: number) => [`€${v.toLocaleString()}`, 'Spend']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {data.charts.spend_by_campaign.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? '#10b981' : '#059669'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionTitle>CTR vs account average</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.charts.ctr_by_campaign} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} width={130} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
                    formatter={(v: number, name: string) => [`${v}%`, name === 'ctr' ? 'CTR' : 'Avg']}
                  />
                  <ReferenceLine x={data.avg_ctr} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Bar dataKey="ctr" radius={[0, 4, 4, 0]}>
                    {data.charts.ctr_by_campaign.map((d, i) => (
                      <Cell key={i} fill={d.ctr >= data.avg_ctr ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionTitle>Budget efficiency score</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.charts.efficiency_by_campaign} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#71717a' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} width={130} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
                    formatter={(v: number) => [v, 'Score /100']}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {data.charts.efficiency_by_campaign.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.score >= 60 ? '#10b981' : d.score >= 35 ? '#f59e0b' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionTitle>ROAS by campaign</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.charts.roas_by_campaign} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(v) => `${v}x`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} width={130} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
                    formatter={(v: number) => [`${v}x`, 'ROAS']}
                  />
                  <ReferenceLine x={1} stroke="#f43f5e" strokeDasharray="3 3" />
                  <Bar dataKey="roas" radius={[0, 4, 4, 0]}>
                    {data.charts.roas_by_campaign.map((d, i) => (
                      <Cell key={i} fill={d.roas >= 2 ? '#10b981' : d.roas >= 1 ? '#f59e0b' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Top / bottom performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <SectionTitle>Top performers</SectionTitle>
              <ul className="space-y-2">
                {data.top_performers.map((name) => (
                  <li key={name} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="text-emerald-400">▲</span> {name}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <SectionTitle>Bottom performers</SectionTitle>
              <ul className="space-y-2">
                {data.bottom_performers.map((name) => (
                  <li key={name} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="text-rose-400">▼</span> {name}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Recommendations */}
          <div>
            <SectionTitle>AI recommendations</SectionTitle>
            <div className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} rank={i + 1} />
              ))}
            </div>
          </div>

          {/* Budget suggestions */}
          {data.budget_suggestions.length > 0 && (
            <div>
              <SectionTitle>Budget reallocation suggestions</SectionTitle>
              <div className="space-y-3">
                {data.budget_suggestions.map((s, i) => (
                  <Card key={i}>
                    <p className="text-sm font-semibold text-white mb-1">{s.campaign_name}</p>
                    <div className="flex items-center gap-3 text-sm mb-2">
                      <span className="text-zinc-400">Current <span className="text-white font-medium">€{s.current_budget.toLocaleString()}</span></span>
                      <span className="text-zinc-600">→</span>
                      <span className="text-zinc-400">Suggested <span className="text-emerald-400 font-medium">€{s.suggested_budget.toLocaleString()}</span></span>
                    </div>
                    <p className="text-xs text-zinc-400">{s.reason}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Campaign table */}
          <div>
            <SectionTitle>Campaign breakdown</SectionTitle>
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Campaign','Spend','Impressions','Clicks','Conv.','CTR','CPC','CPA','ROAS','Score'].map((h) => (
                      <th key={h} className="text-left text-xs text-zinc-500 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((c, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 text-zinc-200 max-w-[180px] truncate">{c.campaign_name}</td>
                      <td className="px-4 py-3 text-zinc-300">€{c.spend.toLocaleString()}</td>
                      <td className="px-4 py-3 text-zinc-400">{c.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-zinc-400">{c.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-zinc-400">{c.conversions}</td>
                      <td className="px-4 py-3 text-zinc-300">{c.ctr}%</td>
                      <td className="px-4 py-3 text-zinc-300">€{c.cpc}</td>
                      <td className="px-4 py-3 text-zinc-300">{c.cpa > 0 ? `€${c.cpa}` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={c.roas >= 2 ? 'text-emerald-400' : c.roas >= 1 ? 'text-amber-400' : 'text-rose-400'}>
                          {c.roas > 0 ? `${c.roas}x` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-16">
                          <ScoreBar score={c.budget_efficiency} max={100} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
