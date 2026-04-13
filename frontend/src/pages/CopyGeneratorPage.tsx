import { LANGUAGES, OBJECTIVES, PLATFORMS, TONES } from '../constants/copyGeratorConstants'

import { TextArea, TabBar, CombinationsTab, VariantTab } from '../features/copy/CopyGeneratorParts'
import { useCopyGenerator } from '../features/copy/useCopyGenerator'

import Card from '../components/ui/Card'
import SectionTitle from '../components/ui/SectionTitle'
import Spinner from '../components/ui/Spinner'
import ErrorBanner from '../components/ui/ErrorBanner'
import Select from '../components/ui/Select'

export default function CopyGeneratorPage() {
  const { form, setField, loading, error, data, tab, setTab, charLimit, isFormValid, generate } =
    useCopyGenerator()

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Campaign parameters</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Select label="Platform" options={PLATFORMS} value={form.platform} onChange={(value) => setField('platform', value)} />
          <Select label="Objective" options={OBJECTIVES} value={form.objective} onChange={(value) => setField('objective', value)} />
          <Select label="Tone" options={TONES} value={form.tone} onChange={(value) => setField('tone', value)} />
          <Select label="Language" options={LANGUAGES} value={form.language} onChange={(value) => setField('language', value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <TextArea label="Target audience" value={form.audience} maxLength={500}
            placeholder="e.g. Online shoppers aged 25-45 who abandoned cart in the last 7 days"
            onChange={(v) => setField('audience', v)} />
          <TextArea label="Product / service" value={form.product_description} maxLength={1000}
            placeholder="e.g. Premium running shoes — 30% off, free shipping, limited stock"
            onChange={(v) => setField('product_description', v)} />
        </div>
        <button onClick={generate} disabled={loading || !isFormValid}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg px-6 py-2.5 transition-colors flex items-center gap-2"
        >
          {loading ? <><Spinner className="w-4 h-4" /> Generating…</> : 'Generate copy'}
        </button>
        {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
      </Card>

      {data && (
        <>
          <TabBar tab={tab} onTabChange={setTab} />
          {tab === 'combinations' && <CombinationsTab data={data} charLimit={charLimit} />}
          {tab === 'headlines' && <VariantTab title={`Headlines — ${data.headlines.length} variants${charLimit ? ` · limit ${charLimit} chars` : ''}`} items={data.headlines} label="H" />}
          {tab === 'texts' && <VariantTab title={`Primary texts — ${data.primary_texts.length} variants`} items={data.primary_texts}  label="T"   />}
          {tab === 'ctas' && <VariantTab title={`CTAs — ${data.ctas.length} variants`} items={data.ctas} label="CTA" />}
        </>
      )}
    </div>
  )
}