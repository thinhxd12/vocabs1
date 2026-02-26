import { toast } from "svelte-sonner";
import type {
  CurrentlyWeatherType,
  HourlyWeatherType,
  OpenMeteoResponse,
  WeatherQueryParams,
} from "../types";
import { v7 as uuidv7 } from "uuid";
import { totalMemories } from "$lib/store/navstore";
import type { SupabaseClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { page } from "$app/state";

export function base64ToUint8Array(base64String: string) {
  const binaryString = atob(base64String);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return uint8Array;
}

export const getTranslationArr = (str: string) => {
  const breakpoint = /\s+-/g;
  let means = str.split(breakpoint).filter((item) => item);
  const matchesMean = means.map((m) => {
    if (m) {
      let newM = /(\w+)\-.+/.exec(m);
      return {
        partOfSpeech: newM ? newM[1] : "null",
        translations: newM
          ? m
              .replace(newM[1], "")
              .split(/\-|\s-/)
              .filter((item) => item)
          : [],
      };
    }
  });
  return matchesMean;
};

export const getCurrentWeatherData = async ({
  lat: lat,
  lon: lon,
}: {
  lat: string;
  lon: string;
}) => {
  "use server";
  const params = {
    latitude: lat,
    longitude: lon,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "uv_index",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
    models: "best_match",
    timezone: "auto",
  };

  const url = "https://api.open-meteo.com/v1/forecast?";
  const paramsString = new URLSearchParams(params).toString();
  const responses = await fetch(url + paramsString);
  if (responses.status !== 200) return;
  const data = await responses.json();

  const result: CurrentlyWeatherType = {
    apparentTemperature: data.current.apparent_temperature,
    isDayTime: data.current.is_day,
    humidity: data.current.relative_humidity_2m,
    temperature: data.current.temperature_2m,
    uvIndex: data.current.uv_index,
    icon: data.current.weather_code,
    windDirection: data.current.wind_direction_10m,
    windSpeed: data.current.wind_speed_10m,
  };
  return result;
};

export const getHourlyWeatherData = async ({
  lat: lat,
  lon: lon,
}: {
  lat: string;
  lon: string;
}) => {
  "use server";
  const params = {
    latitude: String(lat),
    longitude: String(lon),
    hourly: [
      "temperature_2m",
      "precipitation_probability",
      "weather_code",
      "is_day",
    ].join(","),
    forecast_hours: String(24),
    models: "best_match",
    timezone: "auto",
  };

  const url = "https://api.open-meteo.com/v1/forecast?";
  const paramsString = new URLSearchParams(params).toString();
  const responses = await fetch(url + paramsString);
  if (responses.status !== 200) return;
  const data = await responses.json();

  const result = data.hourly.time.map((item: string, index: number) => ({
    time: item,
    temperature: data.hourly.temperature_2m[index],
    icon: data.hourly.weather_code[index],
    probability: data.hourly.precipitation_probability[index],
    isDayTime: data.hourly.is_day[index],
  }));
  return result as HourlyWeatherType[];
};

export const getCurrentWeatherTomorrowData = async (
  lat: number,
  lon: number,
) => {
  const url = `https://api.tomorrow.io/v4/weather/realtime?location=${lat}, ${lon}&apikey=iKOCmIMApJ9ZJoeGT3JjQgr7Fvx6jQVi`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "accept-encoding": "deflate, gzip, br",
    },
  };

  const response = await fetch(url, options);
  if (response.status == 200) {
    const result = await response.json();
    return result.data;
  }
};

export const getHourlyWeatherTomorrowData = async (
  lat: number,
  lon: number,
) => {
  const url = `https://api.tomorrow.io/v4/weather/forecast?location=${lat}, ${lon}&timesteps=1h&apikey=iKOCmIMApJ9ZJoeGT3JjQgr7Fvx6jQVi`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "accept-encoding": "deflate, gzip, br",
    },
  };

  const response = await fetch(url, options);
  if (response.status == 200) {
    const result = await response.json();
    return result.timelines;
  }
};

export const archiveVocab = async (id: string, word: string) => {
  const { error: errorMemories } = await page.data.supabase
    .from("memories_table")
    .insert({ id: uuidv7(), word: word });

  if (errorMemories) {
    toast.error("Error!", {
      description: errorMemories.message as string,
      class: "my-toast-error",
      classes: {
        title: "text-[#f70000] text-14",
        description: "text-black/80 text-12",
      },
    });
    return;
  }

  const { error: errorDeleteVocab } = await page.data.supabase
    .from("vocab_table")
    .delete()
    .eq("id", id);

  if (errorDeleteVocab) {
    toast.error("Error!", {
      description: errorDeleteVocab.message as string,
      class: "my-toast-error",
      classes: {
        title: "text-[#f70000] text-14",
        description: "text-black/80 text-12",
      },
    });
    return;
  }

  const { count: lengthVocabTable } = await page.data.supabase
    .from("vocab_table")
    .select("*", { count: "exact", head: true });

  if (!lengthVocabTable || lengthVocabTable % 200 === 0) {
    totalMemories.update((n) => n + 1);
    return;
  }

  if (lengthVocabTable < 200) {
    totalMemories.update((n) => n + 1);
    return;
  }

  const endOfIndex = Math.floor(lengthVocabTable / 200) * 200;
  const { data: rangeResults } = await page.data.supabase
    .from("vocab_table")
    .select("id,number")
    .order("id", { ascending: true })
    .range(endOfIndex, endOfIndex + lengthVocabTable - 1);

  if (!rangeResults) return;
  const smallestRow = rangeResults.reduce(
    (min: any, row: any) => (row.number < min.number ? row : min),
    rangeResults[0],
  );

  const { error: lastError } = await page.data.supabase
    .from("vocab_table")
    .update({ id: id })
    .eq("id", smallestRow.id);

  if (!lastError) totalMemories.update((n) => n + 1);
};

/**
 * RTK Query API for weather data using Open-Meteo SDK.
 *
 * Fetches weather data directly from Open-Meteo API using FlatBuffers for efficiency.
 *
 * @see https://redux-toolkit.js.org/rtk-query/overview
 * @see https://open-meteo.com/en/docs
 */

export const getOpenMeteoWeather = async ({
  latitude,
  longitude,
  tempUnit = "c",
}: WeatherQueryParams) => {
  const param1 = {
    latitude: String(latitude),
    longitude: String(longitude),
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
    models: "metno_seamless",
    temperature_unit: tempUnit === "c" ? "celsius" : "fahrenheit",
    timezone: "auto",
    forecast_hours: "12",
    forecast_days: "7",
  };

  const url1 = "https://api.open-meteo.com/v1/forecast?";
  const params1 = new URLSearchParams(param1).toString();

  const param2 = {
    latitude: String(latitude),
    longitude: String(longitude),
    current: ["us_aqi", "uv_index"].join(","),
  };

  const url2 = "https://air-quality-api.open-meteo.com/v1/air-quality?";
  const params2 = new URLSearchParams(param2).toString();

  const [response1, response2] = await Promise.all([
    fetch(url1 + params1),
    fetch(url2 + params2),
  ]);

  if (!response1.ok || !response2.ok) {
    throw new Error("One or both requests failed");
  }

  const data1 = await response1.json();
  const data2 = await response2.json();

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
      apparent_temperature: Array.from(data1.hourly.apparent_temperature ?? []),
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

  return result;
};
