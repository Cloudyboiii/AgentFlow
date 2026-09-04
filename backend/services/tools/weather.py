import requests


def get_weather(city: str) -> dict:
    """Get current weather for a city using Open-Meteo API (free, no key needed)."""
    try:
        # Geocode city to lat/lon
        geo_url = "https://geocoding-api.open-meteo.com/v1/search"
        geo_resp = requests.get(geo_url, params={"name": city, "count": 1}, timeout=10)
        geo_data = geo_resp.json()

        if not geo_data.get("results"):
            return {"error": f"City '{city}' not found."}

        location = geo_data["results"][0]
        lat = location["latitude"]
        lon = location["longitude"]
        resolved_name = location.get("name", city)
        country = location.get("country", "")

        # Fetch weather
        weather_url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": True,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        }
        weather_resp = requests.get(weather_url, params=params, timeout=10)
        weather_data = weather_resp.json()

        current = weather_data.get("current", {})
        current_weather = weather_data.get("current_weather", {})

        # Map weather codes to descriptions
        code = current_weather.get("weathercode", current.get("weather_code", 0))
        condition = _weather_code_to_text(code)

        return {
            "city": resolved_name,
            "country": country,
            "temperature_celsius": current.get("temperature_2m", current_weather.get("temperature")),
            "humidity_percent": current.get("relative_humidity_2m"),
            "wind_speed_kmh": current.get("wind_speed_10m", current_weather.get("windspeed")),
            "condition": condition,
        }
    except Exception as e:
        return {"error": str(e)}


def _weather_code_to_text(code: int) -> str:
    mapping = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Depositing rime fog",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
        80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
    }
    return mapping.get(code, f"Weather code {code}")
