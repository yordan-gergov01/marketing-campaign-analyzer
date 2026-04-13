import { useState } from 'react'
import { generateCopy } from '../services/api'
import type { CopyResponse, CopyRequest, Objective, Tone, CopyPlatform, Language } from '../types/api-types'
import { Spinner, Card, SectionTitle, ErrorBanner, ScoreBar, Badge } from '../components/ui'

const OBJECTIVES: Objective[] = ['conversions', 'traffic', 'awareness', 'leads', 'engagement']
const TONES: Tone[]           = ['professional', 'casual', 'urgent', 'emotional', 'humorous']
const PLATFORMS: CopyPlatform[]= ['meta', 'google', 'linkedin', 'tiktok']
const LANGUAGES: Language[]   = ['english', 'bulgarian']

function Select<T extends string>({
  label, options, value, onChange,
}: { label: string; options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o} className="capitalize">{o}</option>
        ))}
      </select>
    </div>
  )
}

function CopyCard({ label, text, score, reason, breakdown }: {
  label: string; text: string; score: number
  reason: string; breakdown: Record<string, number>
}) {
  const [open, setOpen] = useState(false)
  return (
    <div
      onClick={() => setOpen(!open)}
      className="cursor-pointer bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg px-4 py-3 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm text-zinc-100 flex-1">{text}</p>
        <span className="text-xs font-bold text-emerald-400 shrink-0">{score.toFixed(1)}</span>
      </div>
      <ScoreBar score={score} />
      {open && (
        <div className="mt-3 pt-3 border-t border-zinc-700/50 space-y-2">
          <p className="text-xs text-zinc-400">{reason}</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(breakdown).map(([k, v]) => (
              <div key={k} className="text-center">
                <p className="text-xs text-zinc-500 capitalize">{k.replace('_', ' ')}</p>
                <p className="text-sm font-semibold text-white">{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CopyGeneratorPage() {
  const [form, setForm] = useState<CopyRequest>({
    objective: 'conversions',
    audience: '',
    product_description: '',
    tone: 'professional',
    platform: 'meta',
    language: 'english',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [data,    setData]    = useState<CopyResponse | null>(null)
  const [tab,     setTab]     = useState<'combinations' | 'headlines' | 'texts' | 'ctas'>('combinations')

  const set = <K extends keyof CopyRequest>(k: K, v: CopyRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  async function handleGenerate() {
    if (!form.audience.trim() || !form.product_description.trim()) return
    setLoading(true)
    setError(null)
    try {
      setData(await generateCopy(form))
      setTab('combinations')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const charLimit = form.platform === 'meta' ? 40 : form.platform === 'google' ? 30 : null

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <SectionTitle>Campaign parameters</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Select label="Platform"  options={PLATFORMS}  value={form.platform}  onChange={(v) => set('platform', v)} />
          <Select label="Objective" options={OBJECTIVES} value={form.objective} onChange={(v) => set('objective', v)} />
          <Select label="Tone"      options={TONES}      value={form.tone}      onChange={(v) => set('tone', v)} />
          <Select label="Language"  options={LANGUAGES}  value={form.language}  onChange={(v) => set('language', v)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Target audience</label>
            <textarea
              rows={3}
              placeholder="e.g. Online shoppers aged 25-45 who abandoned cart in the last 7 days"
              value={form.audience}
              onChange={(e) => set('audience', e.target.value)}
              maxLength={500}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
            <p className="text-xs text-zinc-600 mt-1 text-right">{form.audience.length}/500</p>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Product / service</label>
            <textarea
              rows={3}
              placeholder="e.g. Premium running shoes — 30% off, free shipping, limited stock"
              value={form.product_description}
              onChange={(e) => set('product_description', e.target.value)}
              maxLength={1000}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
            <p className="text-xs text-zinc-600 mt-1 text-right">{form.product_description.length}/1000</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !form.audience.trim() || !form.product_description.trim()}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg px-6 py-2.5 transition-colors flex items-center gap-2"
        >
          {loading ? <><Spinner className="w-4 h-4" /> Generating…</> : 'Generate copy'}
        </button>
        {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
      </Card>

      {data && (
        <>
          {/* Tab bar */}
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
            {(['combinations', 'headlines', 'texts', 'ctas'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  tab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Top combinations */}
          {tab === 'combinations' && (
            <div className="space-y-4">
              <SectionTitle>Top combinations</SectionTitle>
              {data.top_combinations.map((combo, i) => (
                <Card key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Combination #{i + 1}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400">Predicted CTR: <span className="text-emerald-400 font-medium">{combo.predicted_ctr}</span></span>
                      <span className="text-xs font-bold text-emerald-400">{combo.total_score.toFixed(1)}/10</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-zinc-800/60 rounded-lg px-3 py-2">
                      <p className="text-xs text-zinc-500 mb-1">Headline {charLimit && <span className="text-zinc-600">· {combo.headline.length}/{charLimit} chars</span>}</p>
                      <p className="text-sm font-semibold text-white">{combo.headline}</p>
                      {charLimit && combo.headline.length > charLimit && (
                        <p className="text-xs text-amber-400 mt-1">⚠ Exceeds {charLimit}-char limit</p>
                      )}
                    </div>
                    <div className="bg-zinc-800/60 rounded-lg px-3 py-2">
                      <p className="text-xs text-zinc-500 mb-1">Primary text</p>
                      <p className="text-sm text-zinc-200">{combo.primary_text}</p>
                    </div>
                    <div className="bg-zinc-800/60 rounded-lg px-3 py-2">
                      <p className="text-xs text-zinc-500 mb-1">CTA</p>
                      <p className="text-sm font-medium text-emerald-400">{combo.cta}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Headlines */}
          {tab === 'headlines' && (
            <div>
              <SectionTitle>Headlines — {data.headlines.length} variants {charLimit && `· limit ${charLimit} chars`}</SectionTitle>
              <div className="space-y-2">
                {data.headlines.map((h, i) => (
                  <CopyCard key={i} label="H" text={h.text} score={h.score} reason={h.reason} breakdown={h.score_breakdown} />
                ))}
              </div>
            </div>
          )}

          {/* Primary texts */}
          {tab === 'texts' && (
            <div>
              <SectionTitle>Primary texts — {data.primary_texts.length} variants</SectionTitle>
              <div className="space-y-2">
                {data.primary_texts.map((t, i) => (
                  <CopyCard key={i} label="T" text={t.text} score={t.score} reason={t.reason} breakdown={t.score_breakdown} />
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          {tab === 'ctas' && (
            <div>
              <SectionTitle>CTAs — {data.ctas.length} variants</SectionTitle>
              <div className="space-y-2">
                {data.ctas.map((c, i) => (
                  <CopyCard key={i} label="CTA" text={c.text} score={c.score} reason={c.reason} breakdown={c.score_breakdown} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
