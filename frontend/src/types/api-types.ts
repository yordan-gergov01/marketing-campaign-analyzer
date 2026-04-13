// Mirrors models/schemas.py

export type Platform = 'meta' | 'google' | 'unknown'
export type Category = 'budget' | 'audience' | 'creative' | 'bidding' | 'targeting'
export type Objective = 'conversions' | 'traffic' | 'awareness' | 'leads' | 'engagement'
export type Tone = 'professional' | 'casual' | 'urgent' | 'emotional' | 'humorous'
export type CopyPlatform = 'meta' | 'google' | 'linkedin' | 'tiktok'
export type Language = 'english' | 'bulgarian'
export type ROIScenarioName = 'conservative' | 'realistic' | 'optimistic'

// /api/analyze

export interface CampaignMetrics {
  campaign_name: string
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  spend: number
  conversions: number
  cpa: number
  roas: number
  budget_efficiency: number
}

export interface Recommendation {
  title: string
  description: string
  impact_score: number
  category: Category
  action: string
}

export interface BudgetSuggestion {
  campaign_name: string
  current_budget: number
  suggested_budget: number
  reason: string
}

export interface AnalysisResponse {
  platform: Platform
  total_spend: number
  total_clicks: number
  total_impressions: number
  total_conversions: number
  avg_ctr: number
  avg_cpc: number
  avg_roas: number
  campaigns: CampaignMetrics[]
  top_performers: string[]
  bottom_performers: string[]
  recommendations: Recommendation[]
  budget_suggestions: BudgetSuggestion[]
  charts: {
    spend_by_campaign: { name: string; value: number }[]
    ctr_by_campaign: { name: string; ctr: number; avg: number }[]
    roas_by_campaign: { name: string; roas: number }[]
    efficiency_by_campaign: { name: string; score: number }[]
  }
}

// /api/generate-copy

export interface CopyRequest {
  objective: Objective
  audience: string
  product_description: string
  tone: Tone
  platform: CopyPlatform
  language: Language
}

export interface CopyVariant {
  text: string
  score: number
  score_breakdown: {
    relevance: number
    emotion: number
    clarity: number
    platform_fit: number
  }
  reason: string
}

export interface TopCombination {
  headline: string
  primary_text: string
  cta: string
  total_score: number
  predicted_ctr: string
}

export interface CopyResponse {
  headlines: CopyVariant[]
  primary_texts: CopyVariant[]
  ctas: CopyVariant[]
  top_combinations: TopCombination[]
}

// /api/revise-plan

export interface ChannelPlan {
  channel: string
  budget: number
  budget_pct: number
  objective: string
  target_audience: string
  kpi: string
  rationale: string
}

export interface PlanChange {
  area: string
  original: string
  revised: string
  reason: string
  expected_impact: string
}

export interface ROIScenario {
  name: ROIScenarioName
  projected_roas: number
  projected_conversions: number
  projected_revenue: number
  assumptions: string
}

export interface MediaPlanResponse {
  original_summary: string
  revised_channels: ChannelPlan[]
  total_budget: number
  changes: PlanChange[]
  roi_projections: ROIScenario[]
  executive_summary: string
  docx_base64?: string
}
