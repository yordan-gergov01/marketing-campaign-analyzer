import { AnalysisResponse } from "../../../types/api-types";
import SectionTitle from "../../../components/ui/SectionTitle";
import RecommendationCard from "./RecommendationCard";

function RecommendationsSection({ data }: { data: AnalysisResponse }) {
    return (
      <div>
        <SectionTitle>AI recommendations</SectionTitle>
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} />
          ))}
        </div>
      </div>
    )
  }

export default RecommendationsSection;