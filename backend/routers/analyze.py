from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import Optional
from services.csv_parser import parse_csv
from services.ai_service import analyse_campaigns
from models.schemas import AnalysisResponse, Recommendation, BudgetSuggestion, CampaignMetrics

router = APIRouter()

VALID_CATEGORIES = {"budget", "audience", "creative", "bidding", "targeting"}


def _sanitize_recommendation(r: dict) -> dict:
    """
    Guard against malformed AI output before Pydantic validation.
    The LLM occasionally returns composite values like 'creative|targeting'
    or 'budget/bidding' - we take the first valid token.
    """
    raw_cat = str(r.get("category", "")).lower().strip()

    # Split on common separators the LLM uses
    for sep in ("|", "/", ",", " "):
        parts = [p.strip() for p in raw_cat.split(sep)]
        for p in parts:
            if p in VALID_CATEGORIES:
                r["category"] = p
                break
        else:
            continue
        break
    else:
        # Nothing matched - default to 'targeting' so Pydantic doesn't crash
        r["category"] = "targeting"

    # Clamp impact_score to 1-10
    try:
        r["impact_score"] = max(1, min(10, int(r.get("impact_score", 5))))
    except (TypeError, ValueError):
        r["impact_score"] = 5

    return r


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_campaign(
    file: UploadFile = File(...),
    avg_order_value: Optional[float] = Query(
        default=None,
        gt=0,
        description="Average order value in the same currency as spend. Used to compute ROAS when the CSV has no conversion value column.",
    ),
):

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    # Parse CSV
    parsed = parse_csv(file_bytes, avg_order_value=avg_order_value)

    # AI analysis
    ai_result = await analyse_campaigns(parsed["metrics_json"], parsed["platform"])

    # Sanitize AI output before Pydantic validation
    raw_recs = [_sanitize_recommendation(r) for r in ai_result.get("recommendations", [])]
    raw_budgs = ai_result.get("budget_suggestions", [])

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
        recommendations=[Recommendation(**r) for r in raw_recs],
        budget_suggestions=[BudgetSuggestion(**b) for b in raw_budgs],
        charts=parsed["charts"],
    )
