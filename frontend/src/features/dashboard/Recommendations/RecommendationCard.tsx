import { useState } from "react";

import { Recommendation } from "../../../types/api-types";
import { CATEGORY_ICON } from "../../../constants/dashboardConstants";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import ScoreBar from "../../../components/ui/ScoreBar";

function RecommendationCard({ rec }: { rec: Recommendation }) {
    const [open, setOpen] = useState<boolean>(false)
    return (
      <Card className="cursor-pointer hover:border-zinc-700 transition-colors">
        <div className="flex items-start gap-3" onClick={() => setOpen(!open)}>
          <span className="text-xl">{CATEGORY_ICON[rec.category]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-white truncate">{rec.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                <Badge label={rec.category} />
                <span className="text-xs font-bold text-emerald-400">{rec.impact_score}/10</span>
              </div>
            </div>
            <ScoreBar score={rec.impact_score} />
          </div>
        </div>
        {open && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
            <p className="text-sm text-zinc-300">{rec.description}</p>
            <div className="flex items-start gap-2 mt-3 bg-zinc-800/60 rounded-lg px-3 py-2">
              <span className="text-emerald-400 text-xs font-bold mt-0.5">ACTION</span>
              <p className="text-sm text-zinc-200">{rec.action}</p>
            </div>
          </div>
        )}
      </Card>
    )
  }

export default RecommendationCard;