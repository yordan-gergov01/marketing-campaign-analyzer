from fastapi import APIRouter, UploadFile, File, HTTPException
from services.csv_parser import parse_csv
from services.ai_service import analyse_campaigns
from models.schemas import AnalysisResponse, Recommendation, BudgetSuggestion, CampaignMetrics

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_campaign(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    # Parse CSV with pandas
    parsed = parse_csv(file_bytes)

    # AI analysis
    ai_result = await analyse_campaigns(parsed["metrics_json"], parsed["platform"])

    # Build response
    return AnalysisResponse(
        platform=parsed["platform"],
        total_spend=parsed["total_spend"],
        total_clicks=parsed["total_clicks"],
        total_impressions=parsed["total_impressions"],
        total_conversions=parsed["total_conversions"],
        avg_ctr=parsed["avg_ctr"],
        avg_cpc=parsed["avg_cpc"],
        avg_roas=parsed["avg_roas"],
        campaigns=[CampaignMetrics(**c) for c in parsed["campaigns"]],
        top_performers=parsed["top_performers"],
        bottom_performers=parsed["bottom_performers"],
        recommendations=[
            Recommendation(**r) for r in ai_result.get("recommendations", [])
        ],
        budget_suggestions=[
            BudgetSuggestion(**b) for b in ai_result.get("budget_suggestions", [])
        ],
        charts=parsed["charts"],
    )
