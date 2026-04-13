function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
    const pct = Math.min((score / max) * 100, 100)
    const color = pct >= 70 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-rose-400'
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-zinc-400 w-6 text-right">{score}</span>
      </div>
    )
  }

export default ScoreBar;