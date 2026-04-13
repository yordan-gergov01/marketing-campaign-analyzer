import { useState } from "react";
import ScoreBar from "../../components/ui/ScoreBar";

function CopyCard({ text, score, reason, breakdown }: {
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

export default CopyCard;