import type { OpenMeteoResponse } from "$lib/types.js";
import { error } from "@sveltejs/kit";

export async function GET({ url }) {
  const lat = url.searchParams.get("lat") || "52.52";
  const lon = url.searchParams.get("lon") || "13.41";
  const unit = url.searchParams.get("unit") || "c";
  const model = url.searchParams.get("model") || "ecmwf_ifs";
  try {
    const param1 = {
      latitude: lat,
      longitude: lon,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "visibility",
        "pressure_msl",
        "dew_point_2m",
        "cloud_cover",
        "rain",
        "showers",
        "snowfall",
        "snow_depth",
        "is_day",
      ].join(","),
      hourly: [
        "temperature_2m",
        "apparent_temperature",
        "precipitation_probability",
        "weather_code",
        "wind_speed_10m",
        "is_day",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "precipitation_probability_max",
        "sunrise",
        "sunset",
        "uv_index_max",
      ].join(","),
      models: model,
      temperature_unit: unit === "c" ? "celsius" : "fahrenheit",
      timezone: "auto",
      forecast_hours: "12",
      forecast_days: "7",
    };

    const url1 = "https://api.open-meteo.com/v1/forecast?";
    const params1 = new URLSearchParams(param1).toString();

    const param2 = {
      latitude: lat,
      longitude: lon,
      current: ["us_aqi", "uv_index"].join(","),
    };

    const url2 = "https://air-quality-api.open-meteo.com/v1/air-quality?";
    const params2 = new URLSearchParams(param2).toString();

    const responses = await Promise.all([
      fetch(url1 + params1),
      fetch(url2 + params2),
    ]);

    const data1 = await responses[0].json();
    const data2 = await responses[1].json();

    const result: OpenMeteoResponse = {
      latitude: data1.latitude,
      longitude: data1.longitude,
      timezone: data1.timezone || "UTC",
      timezone_abbreviation: data1.timezone_abbreviation,
      utc_offset_seconds: data1.utc_offset_seconds,
      current: {
        time: data1.current.time,
        is_day: data1.current.is_day ?? 0,
        temperature_2m: data1.current.temperature_2m ?? 0,
        relative_humidity_2m: data1.current.relative_humidity_2m ?? 0,
        apparent_temperature: data1.current.apparent_temperature ?? 0,
        precipitation: data1.current.precipitation ?? 0,
        weather_code: data1.current.weather_code ?? 0,
        wind_speed_10m: data1.current.wind_speed_10m ?? 0,
        wind_direction_10m: data1.current.wind_direction_10m ?? 0,
        wind_gusts_10m: data1.current.wind_gusts_10m ?? 0,
        visibility: data1.current.visibility ?? 0,
        pressure_msl: data1.current.pressure_msl ?? 0,
        dew_point_2m: data1.current.dew_point_2m ?? 0,
        cloud_cover: data1.current.cloud_cover ?? 0,
        rain: data1.current.rain ?? 0,
        showers: data1.current.showers ?? 0,
        snowfall: data1.current.snowfall ?? 0,
        snow_depth: data1.current.snow_depth ?? 0,
        us_aqi: data2.current.us_aqi ?? 0,
        uv_index: data2.current.uv_index ?? 0,
      },
      hourly: {
        time: Array.from(data1.hourly.time ?? []),
        is_day: Array.from(data1.hourly.is_day ?? []),
        temperature_2m: Array.from(data1.hourly.temperature_2m ?? []),
        apparent_temperature: Array.from(
          data1.hourly.apparent_temperature ?? [],
        ),
        precipitation_probability: Array.from(
          data1.hourly.precipitation_probability ?? [],
        ),
        weather_code: Array.from(data1.hourly.weather_code ?? []),
        wind_speed_10m: Array.from(data1.hourly.wind_speed_10m ?? []),
      },
      daily: {
        time: Array.from(data1.daily.time ?? []),
        weather_code: Array.from(data1.daily.weather_code ?? []),
        temperature_2m_max: Array.from(data1.daily.temperature_2m_max ?? []),
        temperature_2m_min: Array.from(data1.daily.temperature_2m_min ?? []),
        apparent_temperature_max: Array.from(
          data1.daily.apparent_temperature_max ?? [],
        ),
        apparent_temperature_min: Array.from(
          data1.daily.apparent_temperature_min ?? [],
        ),
        precipitation_probability_max: Array.from(
          data1.daily.precipitation_probability_max ?? [],
        ),
        sunrise: Array.from(data1.daily.sunrise ?? []),
        sunset: Array.from(data1.daily.sunset ?? []),
        uv_index_max: Array.from(
          data1.daily.uv_index_max.map((element: any) => element ?? 0) ?? [],
        ),
      },
    };
    return new Response(JSON.stringify(result));
  } catch (e) {
    error(404);
  }
}
