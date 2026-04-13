import SectionTitle from "../../components/ui/SectionTitle";
import StatTile from "../../components/ui/StatTitle";
import { fmt } from "../../lib/utils";
import { AnalysisResponse } from "../../types/api-types";

function KpiRow({ data }: { data: AnalysisResponse }) {
    return (
      <div>
        <SectionTitle>Account overview · {data.platform}</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Total spend" value={`€${fmt(data.total_spend)}`} />
          <StatTile label="Conversions" value={String(data.total_conversions)} />
          <StatTile label="Avg CTR" value={`${data.avg_ctr}%`} />
          <StatTile label="Avg CPC" value={`€${data.avg_cpc}`} />
        </div>
      </div>
    )
  }

export default KpiRow;
  