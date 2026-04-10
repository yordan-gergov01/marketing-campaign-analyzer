from fastapi import APIRouter
from models.schemas import CopyRequest, CopyResponse, CopyVariant, TopCombination
from services.ai_service import generate_copy

router = APIRouter()


@router.post("/generate-copy", response_model=CopyResponse)
async def generate_ad_copy(req: CopyRequest):
    result = await generate_copy(
        objective=req.objective,
        audience=req.audience,
        product_description=req.product_description,
        tone=req.tone,
        platform=req.platform,
        language=req.language,
    )

    return CopyResponse(
        headlines=[CopyVariant(**h) for h in result.get("headlines", [])],
        primary_texts=[CopyVariant(**t) for t in result.get("primary_texts", [])],
        ctas=[CopyVariant(**c) for c in result.get("ctas", [])],
        top_combinations=[TopCombination(**c) for c in result.get("top_combinations", [])],
    )
