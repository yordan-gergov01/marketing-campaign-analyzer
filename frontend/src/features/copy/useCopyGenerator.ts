import { useState } from 'react'
import { INITIAL_FORM } from '../../constants/copyGeratorConstants'
import { CopyRequest, CopyResponse } from '../../types/api-types'
import { generateCopy } from '../../services/api'

export type TabId = 'combinations' | 'headlines' | 'texts' | 'ctas'

export function useCopyGenerator() {
  const [form, setForm] = useState<CopyRequest>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CopyResponse | null>(null)
  const [tab, setTab] = useState<TabId>('combinations')

  const setField = <K extends keyof CopyRequest>(key: K, value: CopyRequest[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const isFormValid = form.audience.trim() !== '' && form.product_description.trim() !== ''

  const charLimit = form.platform === 'meta' ? 40 : form.platform === 'google' ? 30 : null

  async function generate() {
    if (!isFormValid) return
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

  return { form, setField, loading, error, data, tab, setTab, charLimit, isFormValid, generate }
}