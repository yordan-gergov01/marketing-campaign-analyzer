from pydantic import BaseModel, Field
from typing import Literal, Optional


class CampaignMetrics(BaseModel):
    campaign_name: str
    impressions: int
    clicks: int
    ctr: float
    cpc: float
    spend: float
    conversions: float
    cpa: float
    roas: float
    budget_efficiency: float  # 0-100 score

class Recommendation(BaseModel):
    title: str
    description: str
    impact_score: int         # 1-10
    category: Literal["budget", "audience", "creative", "bidding", "targeting"]
    action: str

class BudgetSuggestion(BaseModel):
    campaign_name: str
    current_budget: float
    suggested_budget: float
    reason: str

class AnalysisResponse(BaseModel):
    platform: Literal["meta", "google", "unknown"]
    total_spend: float
    total_clicks: int
    total_impressions: int
    total_conversions: float
    avg_ctr: float
    avg_cpc: float
    avg_roas: float
    campaigns: list[CampaignMetrics]
    top_performers: list[str]
    bottom_performers: list[str]
    recommendations: list[Recommendation]
    budget_suggestions: list[BudgetSuggestion]
    charts: dict


class CopyRequest(BaseModel):
    objective: Literal["conversions", "traffic", "awareness", "leads", "engagement"]
    audience: str = Field(..., min_length=10, max_length=500)
    product_description: str = Field(..., min_length=10, max_length=1000)
    tone: Literal["professional", "casual", "urgent", "emotional", "humorous"]
    platform: Literal["meta", "google", "linkedin", "tiktok"]
    language: Literal["english", "bulgarian"] = "english"

class CopyVariant(BaseModel):
    text: str
    score: float
    score_breakdown: dict     # {relevance, emotion, clarity, platform_fit}
    reason: str

class TopCombination(BaseModel):
    headline: str
    primary_text: str
    cta: str
    total_score: float
    predicted_ctr: str        # e.g. "2.3% - 3.1%"

class CopyResponse(BaseModel):
    headlines: list[CopyVariant]
    primary_texts: list[CopyVariant]
    ctas: list[CopyVariant]
    top_combinations: list[TopCombination]


class ChannelPlan(BaseModel):
    channel: str
    budget: float
    budget_pct: float
    objective: str
    target_audience: str
    kpi: str
    rationale: str

class PlanChange(BaseModel):
    area: str
    original: str
    revised: str
    reason: str
    expected_impact: str

class ROIScenario(BaseModel):
    name: Literal["conservative", "realistic", "optimistic"]
    projected_roas: float
    projected_conversions: int
    projected_revenue: float
    assumptions: str

class MediaPlanResponse(BaseModel):
    original_summary: str
    revised_channels: list[ChannelPlan]
    total_budget: float
    changes: list[PlanChange]
    roi_projections: list[ROIScenario]
    executive_summary: str
    docx_base64: Optional[str] = None
