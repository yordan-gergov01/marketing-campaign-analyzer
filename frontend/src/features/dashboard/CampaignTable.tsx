import Card from "../../components/ui/Card"
import ScoreBar from "../../components/ui/ScoreBar"
import SectionTitle from "../../components/ui/SectionTitle"
import { AnalysisResponse } from "../../types/api-types"

const TABLE_HEADERS = ['Campaign', 'Spend', 'Impressions', 'Clicks', 'Conv.', 'CTR', 'CPC', 'CPA', 'ROAS', 'Score']

function CampaignTable({ data }: { data: AnalysisResponse }) {
  return (
    <div>
      <SectionTitle>Campaign breakdown</SectionTitle>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {TABLE_HEADERS.map((h) => (
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
  )
}

export default CampaignTable;