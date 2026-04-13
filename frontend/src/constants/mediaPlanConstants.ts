export const CURRENCIES = ['EUR', 'USD', 'GBP']
export const TIMEFRAMES = ['1 month', '3 months', '6 months', '1 year']

export const SCENARIO_COLOR: Record<string, string> = {
  conservative: 'border-zinc-600 bg-zinc-800/40',
  realistic: 'border-emerald-500/30 bg-emerald-500/5',
  optimistic: 'border-violet-500/30 bg-violet-500/5',
}

export const SCENARIO_VALUE_COLOR: Record<string, string> = {
  conservative: 'text-zinc-300',
  realistic: 'text-emerald-400',
  optimistic: 'text-violet-400',
}