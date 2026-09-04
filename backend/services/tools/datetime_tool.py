from datetime import datetime, timezone


def get_current_datetime(timezone_name: str = "UTC") -> dict:
    """Return the current date, time, and day of week."""
    try:
        now = datetime.now(timezone.utc)
        return {
            "date": now.strftime("%Y-%m-%d"),
            "time": now.strftime("%H:%M:%S"),
            "day_of_week": now.strftime("%A"),
            "timezone": "UTC",
            "iso": now.isoformat(),
        }
    except Exception as e:
        return {"error": str(e)}
