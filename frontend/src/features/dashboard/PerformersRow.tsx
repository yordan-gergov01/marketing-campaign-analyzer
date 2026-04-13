import Card from "../../components/ui/Card";
import SectionTitle from "../../components/ui/SectionTitle";
import { AnalysisResponse } from "../../types/api-types";

function PerformersRow({ data }: { data: AnalysisResponse }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle>Top performers</SectionTitle>
          <ul className="space-y-2">
            {data.top_performers.map((name) => (
              <li key={name} className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400">▲</span> {name}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle>Bottom performers</SectionTitle>
          <ul className="space-y-2">
            {data.bottom_performers.map((name) => (
              <li key={name} className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-rose-400">▼</span> {name}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    )
  }

export default PerformersRow;