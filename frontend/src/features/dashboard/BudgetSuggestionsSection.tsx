import Card from "../../components/ui/Card";
import SectionTitle from "../../components/ui/SectionTitle";
import { AnalysisResponse } from "../../types/api-types";

function BudgetSuggestionsSection({ data }: { data: AnalysisResponse }) {
    if (!data.budget_suggestions.length) return null;
    
    return (
      <div>
        <SectionTitle>Budget reallocation suggestions</SectionTitle>
        <div className="space-y-3">
          {data.budget_suggestions.map((s, i) => (
            <Card key={i}>
              <p className="text-sm font-semibold text-white mb-1">{s.campaign_name}</p>
              <div className="flex items-center gap-3 text-sm mb-2">
                <span className="text-zinc-400">Current <span className="text-white font-medium">€{s.current_budget.toLocaleString()}</span></span>
                <span className="text-zinc-600">→</span>
                <span className="text-zinc-400">Suggested <span className="text-emerald-400 font-medium">€{s.suggested_budget.toLocaleString()}</span></span>
              </div>
              <p className="text-xs text-zinc-400">{s.reason}</p>
            </Card>
          ))}
        </div>
      </div>
    )
  }

export default BudgetSuggestionsSection;
  