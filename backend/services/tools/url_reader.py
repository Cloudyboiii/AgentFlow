import requests
from bs4 import BeautifulSoup


def read_url(url: str) -> dict:
    """Fetch a webpage and extract its main text content."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; AgentFlow/1.0)"
        }
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Remove scripts, styles, nav, footer
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        text = soup.get_text(separator="\n", strip=True)
        # Collapse whitespace
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        clean_text = "\n".join(lines)

        # Truncate
        if len(clean_text) > 3000:
            clean_text = clean_text[:3000] + "...[truncated]"

        return {"url": url, "content": clean_text}
    except Exception as e:
        return {"url": url, "error": str(e)}
