from duckduckgo_search import DDGS


def search_web(query: str, max_results: int = 5) -> list[dict]:
    """Search the web using DuckDuckGo and return results."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "snippet": r.get("body", ""),
            }
            for r in results
        ]
    except Exception as e:
        return [{"error": str(e)}]
