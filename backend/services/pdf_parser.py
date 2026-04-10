from fastapi import HTTPException


def extract_pdf_text(file_bytes: bytes) -> str:
    """
    Extracts all text from a PDF file.
    Returns plain text, page by page separated by newlines.
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise HTTPException(status_code=500, detail="PyMuPDF not installed.")

    try:
        doc  = fitz.open(stream=file_bytes, filetype="pdf")
        pages = []
        for page_num, page in enumerate(doc, start=1):
            text = page.get_text("text")
            if text.strip():
                pages.append(f"--- Page {page_num} ---\n{text.strip()}")
        doc.close()

        if not pages:
            raise HTTPException(status_code=400, detail="PDF appears to be empty or image-only.")

        full_text = "\n\n".join(pages)

        # Truncate to ~8000 chars to stay within GPT-4o context comfortably
        if len(full_text) > 8000:
            full_text = full_text[:8000] + "\n\n[... document truncated for analysis ...]"

        return full_text

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {e}")
