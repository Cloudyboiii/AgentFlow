import google.generativeai as genai
from config import get_settings

settings = get_settings()
genai.configure(api_key=settings.GOOGLE_API_KEY)


def summarize_text(text: str, max_points: int = 5) -> dict:
    """Summarize text into key bullet points using Gemini."""
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        prompt = f"""Summarize the following text into {max_points} concise bullet points.
Return only the bullet points, no preamble.

Text:
{text[:4000]}"""

        response = model.generate_content(prompt)
        return {"summary": response.text}
    except Exception as e:
        return {"error": str(e)}
