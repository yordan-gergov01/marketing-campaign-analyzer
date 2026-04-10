from fastapi import HTTPException


def extract_docx_text(file_bytes: bytes) -> str:
    """
    Extract plain text from DOCX content.
    Returns paragraphs joined by newlines.
    """
    try:
        from io import BytesIO
        from docx import Document
    except ImportError:
        raise HTTPException(status_code=500, detail="python-docx not installed.")

    try:
        doc = Document(BytesIO(file_bytes))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
        if not paragraphs:
            raise HTTPException(status_code=400, detail="DOCX appears to be empty.")

        text = "\n".join(paragraphs)
        if len(text) > 12000:
            text = text[:12000] + "\n\n[... document truncated for analysis ...]"
        return text
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read DOCX: {exc}")
