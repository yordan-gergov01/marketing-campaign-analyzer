import { useState } from 'react'
import { revisePlan } from '../services/api'
import type { MediaPlanResponse } from '../types/api-types'
import Card from '../components/ui/Card'
import SectionTitle from '../components/ui/SectionTitle'
import FileDropZone from '../features/file-uploading/FileDropZone'
import { CURRENCIES, SCENARIO_COLOR, SCENARIO_VALUE_COLOR, TIMEFRAMES } from '../constants/mediaPlanConstants'
import Spinner from '../components/ui/Spinner'
import ErrorBanner from '../components/ui/ErrorBanner'
import { downloadDocx } from '../lib/utils'
import Badge from '../components/ui/Badge'

export default function MediaPlanPage() {
  const [planFile, setPlanFile] = useState<File | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [objectives, setObjectives] = useState('')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [timeframe, setTimeframe] = useState('1 month')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MediaPlanResponse | null>(null)

  const canSubmit = planFile && objectives.trim() && budget && !loading

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const result = await revisePlan({
        mediaPlan: planFile!,
        newObjectives: objectives,
        newBudget: Number(budget),
        currency,
        timeframe,
        performanceCsv: csvFile ?? undefined,
      })
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Revision failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload + params */}
      <Card>
        <SectionTitle>Media plan revision</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FileDropZone
            accept=".pdf,.docx"
            label="Drop media plan (PDF or DOCX)"
            hint="Your existing plan · max 15 MB"
            onFile={setPlanFile}
            file={planFile}
          />
          <FileDropZone
            accept=".csv"
            label="Performance CSV (optional)"
            hint="Meta or Google Ads export · enriches the revision"
            onFile={setCsvFile}
            file={csvFile}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="text-xs text-zinc-400 mb-1 block">New objectives</label>
            <input
              type="text"
              placeholder="e.g. Increase ROAS to 4x, focus on new customer acquisition"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Total budget</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="50000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-white focus:outline-none w-20"
              >
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg px-6 py-2.5 transition-colors flex items-center gap-2"
        >
          {loading ? <><Spinner className="w-4 h-4" /> Revising plan…</> : 'Revise plan'}
        </button>
        {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
      </Card>

      {data && (
        <>
          {/* Executive summary + download */}
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <SectionTitle>Executive summary</SectionTitle>
                <p className="text-sm text-zinc-300 leading-relaxed">{data.executive_summary}</p>
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500">Original plan summary</p>
                  <p className="text-sm text-zinc-400 mt-1">{data.original_summary}</p>
                </div>
              </div>
              {data.docx_base64 && (
                <button
                  onClick={() => downloadDocx(data.docx_base64!)}
                  className="shrink-0 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
                >
                  ↓ Download DOCX
                </button>
              )}
            </div>
          </Card>

          {/* ROI projections */}
          <div>
            <SectionTitle>ROI projections · {data.total_budget.toLocaleString()} {currency}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.roi_projections.map((s) => (
                <Card key={s.name} className={`border ${SCENARIO_COLOR[s.name]}`}>
                  <div className="flex items-center justify-between mb-3">
                    <Badge label={s.name} />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-zinc-500">Projected ROAS</p>
                      <p className={`text-2xl font-bold ${SCENARIO_VALUE_COLOR[s.name]}`}>{s.projected_roas}x</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-zinc-500">Conversions</p>
                        <p className="text-sm font-semibold text-white">{s.projected_conversions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Revenue</p>
                        <p className="text-sm font-semibold text-white">€{s.projected_revenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 pt-1 border-t border-zinc-700/50">{s.assumptions}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Channel breakdown */}
          <div>
            <SectionTitle>Revised channel breakdown</SectionTitle>
            <div className="space-y-3">
              {data.revised_channels.map((ch, i) => (
                <Card key={i}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{ch.channel}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{ch.objective}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">€{ch.budget.toLocaleString()}</p>
                      <p className="text-xs text-zinc-500">{ch.budget_pct}% of budget</p>
                    </div>
                  </div>
                  {/* Budget bar */}
                  <div className="h-1.5 bg-zinc-800 rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${Math.min(ch.budget_pct, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-zinc-500">Audience</p>
                      <p className="text-zinc-300 mt-0.5">{ch.target_audience}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">KPI</p>
                      <p className="text-zinc-300 mt-0.5">{ch.kpi}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-zinc-500">Rationale</p>
                      <p className="text-zinc-300 mt-0.5">{ch.rationale}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Key changes */}
          <div>
            <SectionTitle>Key changes from original plan</SectionTitle>
            <div className="space-y-3">
              {data.changes.map((c, i) => (
                <Card key={i}>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{c.area}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg px-3 py-2">
                      <p className="text-xs text-rose-400 mb-1">Before</p>
                      <p className="text-sm text-zinc-300">{c.original}</p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
                      <p className="text-xs text-emerald-400 mb-1">After</p>
                      <p className="text-sm text-zinc-300">{c.revised}</p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1">
                    <p><span className="text-zinc-500">Reason:</span> {c.reason}</p>
                    <p><span className="text-zinc-500">Expected impact:</span> {c.expected_impact}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
