import io
import json
import re
import pandas as pd
from fastapi import HTTPException


META_COLUMNS = {
    "campaign_name":  ["Campaign name", "Campaign Name"],
    "impressions": ["Impressions"],
    "clicks": ["Clicks (all)", "Clicks"],
    "spend": ["Amount spent (BGN)", "Amount spent (USD)", "Amount spent (EUR)", "Amount spent"],
    "ctr": ["CTR (all)", "CTR"],
    "cpc": ["CPC (all)", "CPC (cost per link click)", "CPC"],
    "conversions": ["Results", "Conversions"],
    "cpa": ["Cost per result", "Cost per conversion"],
}

GOOGLE_COLUMNS = {
    "campaign_name": ["Campaign"],
    "impressions": ["Impr.", "Impressions"],
    "clicks": ["Clicks"],
    "spend": ["Cost", "Spend"],
    "ctr": ["CTR"],
    "cpc": ["Avg. CPC"],
    "conversions": ["Conversions"],
    "cpa": ["Cost / conv.", "CPA"],
}


def _detect_platform(df: pd.DataFrame) -> str:
    cols = set(df.columns.str.lower())
    if any("amount spent" in c for c in cols):
        return "meta"
    if any("avg. cpc" in c for c in cols) or "impr." in cols:
        return "google"
    return "unknown"


def _find_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    """Returns the first matching column name from candidates."""
    for c in candidates:
        if c in df.columns:
            return c
    # Case-insensitive fallback
    lower_map = {col.lower(): col for col in df.columns}
    for c in candidates:
        if c.lower() in lower_map:
            return lower_map[c.lower()]
    return None


def _safe_float(val) -> float:
    """Converts messy strings like '€1,234.56' or '12%' to float."""
    if pd.isna(val):
        return 0.0
    s = str(val).strip()
    if not s or s == "--":
        return 0.0
    s = re.sub(r"[^\d,.\-]", "", s)
    # Handle EU decimal format (e.g. 1.234,56)
    if "," in s and "." in s and s.rfind(",") > s.rfind("."):
        s = s.replace(".", "").replace(",", ".")
    else:
        s = s.replace(",", "")
    try:
        return float(s)
    except ValueError:
        return 0.0


def _calculate_efficiency(row: dict) -> float:
    """
    Budget Efficiency Score (0-100).
    Combines ROAS, CTR and CPA into a single score.
    """
    roas_score = min(row["roas"] / 5 * 40, 40)        # max 40 pts (target ROAS=5)
    ctr_score = min(row["ctr"] / 3 * 30, 30)          # max 30 pts (target CTR=3%)
    cpa_score = max(0, 30 - (row["cpa"] / 50 * 30))   # max 30 pts (lower CPA = better)
    return round(roas_score + ctr_score + cpa_score, 1)


def parse_csv(file_bytes: bytes) -> dict:
    """
    Main entry point.
    Returns a dict with: platform, campaigns list, totals, charts data.
    """
    def _read_csv_with_fallbacks(raw: bytes) -> pd.DataFrame:
        last_error = None
        for enc in ("utf-8-sig", "utf-8", "cp1251", "latin-1"):
            for skip in range(0, 8):
                try:
                    data = pd.read_csv(io.BytesIO(raw), encoding=enc, skiprows=skip)
                    if data.shape[1] > 1:
                        return data
                except Exception as err:
                    last_error = err
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {last_error}")

    df = _read_csv_with_fallbacks(file_bytes)

    # Drop empty rows
    df = df.dropna(how="all")

    platform = _detect_platform(df)
    col_map  = META_COLUMNS if platform == "meta" else GOOGLE_COLUMNS

    name_col = _find_column(df, col_map["campaign_name"])
    impressions_col = _find_column(df, col_map["impressions"])
    clicks_col = _find_column(df, col_map["clicks"])
    spend_col = _find_column(df, col_map["spend"])
    conversions_col = _find_column(df, col_map["conversions"])

    if not name_col or not impressions_col or not clicks_col or not spend_col:
        raise HTTPException(
            status_code=400,
            detail=(
                "CSV is missing required columns. "
                "Expected campaign_name, impressions, clicks and spend fields."
            ),
        )

    campaigns = []
    for _, row in df.iterrows():
        campaign_name = str(row.get(name_col, "")).strip()
        if not campaign_name:
            continue

        impressions = int(_safe_float(row.get(impressions_col, 0)))
        clicks = int(_safe_float(row.get(clicks_col, 0)))
        spend = _safe_float(row.get(spend_col, 0))
        conversions = _safe_float(row.get(conversions_col, 0)) if conversions_col else 0.0

        ctr = (clicks / impressions * 100) if impressions > 0 else 0.0
        cpc = (spend / clicks) if clicks > 0 else 0.0
        cpa = (spend / conversions) if conversions > 0 else 0.0
        roas = (conversions * 50 / spend) if spend > 0 else 0.0  # assumes avg order value=50

        campaign_data = {
            "campaign_name": campaign_name,
            "impressions": impressions,
            "clicks": clicks,
            "spend": round(spend, 2),
            "conversions": round(conversions, 2),
            "ctr": round(ctr, 2),
            "cpc": round(cpc, 2),
            "cpa": round(cpa, 2),
            "roas": round(roas, 2),
            "budget_efficiency": _calculate_efficiency({"roas": roas, "ctr": ctr, "cpa": cpa}),
        }
        campaigns.append(campaign_data)

    if not campaigns:
        raise HTTPException(status_code=400, detail="No valid campaign data found in CSV.")

    # Totals
    total_spend = round(sum(c["spend"] for c in campaigns), 2)
    total_clicks = sum(c["clicks"] for c in campaigns)
    total_impressions = sum(c["impressions"] for c in campaigns)
    total_conversions = round(sum(c["conversions"] for c in campaigns), 2)
    avg_ctr = round(total_clicks / total_impressions * 100, 2) if total_impressions > 0 else 0
    avg_cpc = round(total_spend / total_clicks, 2) if total_clicks > 0 else 0
    avg_roas = round(sum(c["roas"] for c in campaigns) / len(campaigns), 2)

    # Sort for top/bottom performers
    sorted_by_roas = sorted(campaigns, key=lambda x: x["roas"], reverse=True)
    top_performers = [c["campaign_name"] for c in sorted_by_roas[:3]]
    bottom_performers = [c["campaign_name"] for c in sorted_by_roas[-3:]]

    # Charts data (ready for Recharts)
    charts = {
        "spend_by_campaign": [
            {"name": c["campaign_name"][:20], "value": c["spend"]} for c in campaigns
        ],
        "ctr_by_campaign": [
            {"name": c["campaign_name"][:20], "ctr": c["ctr"], "avg": avg_ctr} for c in campaigns
        ],
        "roas_by_campaign": [
            {"name": c["campaign_name"][:20], "roas": c["roas"]} for c in campaigns
        ],
        "efficiency_by_campaign": [
            {"name": c["campaign_name"][:20], "score": c["budget_efficiency"]} for c in campaigns
        ],
    }

    return {
        "platform":  platform,
        "total_spend": total_spend,
        "total_clicks": total_clicks,
        "total_impressions": total_impressions,
        "total_conversions": total_conversions,
        "avg_ctr": avg_ctr,
        "avg_cpc": avg_cpc,
        "avg_roas": avg_roas,
        "campaigns": campaigns,
        "top_performers": top_performers,
        "bottom_performers": bottom_performers,
        "charts": charts,
        "metrics_json": json.dumps(campaigns, indent=2),  # for AI analysis
    }
