
import Card from '../components/ui/Card'
import SectionTitle from '../components/ui/SectionTitle'
import Spinner from '../components/ui/Spinner'
import ErrorBanner from '../components/ui/ErrorBanner'

import FileDropZone from '../features/file-uploading/FileDropZone'
import { useDashboard } from '../features/dashboard/useDashboard'
import KpiRow from '../features/dashboard/KpiRow'
import ChartsGrid from '../features/dashboard/ChartsGrid'
import PerformersRow from '../features/dashboard/PerformersRow'
import RecommendationsSection from '../features/dashboard/Recommendations/RecommendationsSection'
import BudgetSuggestionsSection from '../features/dashboard/BudgetSuggestionsSection'
import CampaignTable from '../features/dashboard/CampaignTable'

function DashboardPage() {
  const { file, setFile, aov, setAov, loading, error, data, demoLoading, analyze, loadDemo } = useDashboard()

  return (
    <div className="space-y-8">
      <Card>
        <SectionTitle>Upload campaign export</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FileDropZone accept=".csv" label="Drop Meta or Google Ads CSV" hint="Exported from Ads Manager · max 10 MB" onFile={setFile} file={file} />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">
                Avg. order value (EUR) <span className="text-zinc-600">optional</span>
              </label>
              <input type="number" placeholder="e.g. 80" value={aov} onChange={(e) => setAov(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-zinc-600 mt-1">Used to compute ROAS when not in CSV</p>
            </div>
            <button onClick={analyze} disabled={!file || loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner className="w-4 h-4" /> Analysing…</> : 'Analyse'}
            </button>
            <button onClick={loadDemo} disabled={demoLoading || loading}
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
          <KpiRow data={data} />
          <ChartsGrid data={data} />
          <PerformersRow data={data} />
          <RecommendationsSection data={data} />
          <BudgetSuggestionsSection data={data} />
          <CampaignTable data={data} />
        </>
      )}
    </div>
  )
}

export default DashboardPage;