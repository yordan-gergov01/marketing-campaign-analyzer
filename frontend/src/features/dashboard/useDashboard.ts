import { useState } from 'react'
import { AnalysisResponse } from '../../types/api-types'
import { analyzeCSV } from '../../services/api'

export function useDashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [aov, setAov] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalysisResponse | null>(null)
  const [demoLoading, setDemoLoading] = useState<boolean>(false)

  async function analyze() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      setData(await analyzeCSV(file, aov ? Number(aov) : undefined))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // static data for demo functionality
  async function loadDemo() {
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
      const demoFile = new File([new Blob([csv], { type: 'text/csv' })], 'demo_meta.csv', { type: 'text/csv' })
      setFile(demoFile)
      setData(await analyzeCSV(demoFile, 80))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Demo failed - is the backend running?')
    } finally {
      setDemoLoading(false)
    }
  }

  return { file, setFile, aov, setAov, loading, error, data, demoLoading, analyze, loadDemo }
}