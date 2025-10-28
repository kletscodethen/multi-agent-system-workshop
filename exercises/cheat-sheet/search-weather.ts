import { fetchWeatherApi } from "openmeteo";

const fetchCoordinates = async (location: string) => {
  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location.trim())}&count=1&language=en&format=json`
  ).then(r => r.json());

  const coords = geo?.results?.[0];
  if (!coords) return null;

  return coords;
}

export async function searchWeather({ location, days = 1 }: { location: string; days?: number }) {
  const coords = await fetchCoordinates(location)

  if (!coords) return null;

  // Ask Open-Meteo for "current" weather
  const res = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", {
    latitude: [coords.latitude],
    longitude: [coords.longitude],
    daily: "temperature_2m_max,temperature_2m_min",
    temperature_unit: "celsius",
    forecast_days: Math.min(days ?? 1, 14), // Max 14 days
  });

  const tmax = Array.from(res[0].daily().variables(0).valuesArray())[days - 1];
  const tmin = Array.from(res[0].daily().variables(1).valuesArray())[days - 1];

  return {
    minTemp: `${tmin.toFixed(1)}°C`,
    maxTemp: `${tmax.toFixed(1)}°C`,
  };
}

async function main() {
  console.log(await searchWeather({ location: "London", days: 14 }))
}

main()