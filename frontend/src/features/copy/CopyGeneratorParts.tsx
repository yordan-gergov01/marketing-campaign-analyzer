import type { CopyResponse } from '../../types/api-types'

import Card from '../../components/ui/Card'
import SectionTitle from '../../components/ui/SectionTitle'
import CopyCard from './CopyCard'

import { TabId } from './useCopyGenerator'

export const TABS: TabId[] = ['combinations', 'headlines', 'texts', 'ctas']

// if need to reuse it, create it as UI reusable component
export function TextArea({ label, value, placeholder, maxLength, onChange }: {
  label: string; value: string; placeholder: string; maxLength: number
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
      <textarea rows={3} placeholder={placeholder} value={value} maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
      />
      <p className="text-xs text-zinc-600 mt-1 text-right">{value.length}/{maxLength}</p>
    </div>
  )
}

export function TabBar({ tab, onTabChange }: { tab: TabId; onTabChange: (t: TabId) => void }) {
  return (
    <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
      {TABS.map((t) => (
        <button key={t} onClick={() => onTabChange(t)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
            tab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

export function CombinationsTab({ data, charLimit }: { data: CopyResponse; charLimit: number | null }) {
  return (
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
              <p className="text-xs text-zinc-500 mb-1">
                Headline {charLimit && <span className="text-zinc-600">· {combo.headline.length}/{charLimit} chars</span>}
              </p>
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
  )
}

export function VariantTab({ title, items, label }: {
  title: string
  items: CopyResponse['headlines']
  label: string
}) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="space-y-2">
        {items.map((item, i) => (
          <CopyCard key={i} label={label} text={item.text} score={item.score} reason={item.reason} breakdown={item.score_breakdown} />
        ))}
      </div>
    </div>
  )
}