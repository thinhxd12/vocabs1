import type {
  CurrentlyWeatherType,
  HourlyWeatherType,
  WeatherQueryParams,
} from "../types";
import { v7 as uuidv7 } from "uuid";
import { getTotalMemories } from "$lib/store/navstore";
import { page } from "$app/state";
import { addToast } from "$lib/store/layoutstore";

export async function fetchWithRetry(
  url: string,
  options = {},
  retries = 9,
  delay = 1000,
) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      // 1. Calculate Jitter: Adds a random percentage (0-100%) to the current delay
      const jitter = Math.random() * delay;
      const sleepTime = delay + jitter;

      await new Promise((resolve) => setTimeout(resolve, sleepTime));

      // 2. Exponential Backoff: Double the base delay for the next attempt
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

export function minutesToSeconds(minutes: number) {
  return minutes * 60;
}
export function secondsToMinutes(seconds: number) {
  return Math.floor(seconds / 60);
}
export function padWithZeroes(number: number) {
  return number.toString().padStart(2, "0");
}

export function formatTimerString(timeInSeconds: number): string {
  const minutes = secondsToMinutes(timeInSeconds);
  const remainingSeconds = timeInSeconds % 60;
  return `${padWithZeroes(minutes)}:${padWithZeroes(remainingSeconds)}`;
}

export function shuffle(array: Array<any>) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function autofocus(node: HTMLElement) {
  node.focus();

  return {
    destroy() {},
  };
}

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
    addToast({
      type: "error",
      title: "Error!",
      message: errorMemories.message as string,
    });
    return;
  }

  const { error: errorDeleteVocab } = await page.data.supabase
    .from("vocab_table")
    .delete()
    .eq("id", id);

  if (errorDeleteVocab) {
    addToast({
      type: "error",
      title: "Error!",
      message: errorDeleteVocab.message as string,
    });
    return;
  }

  const { count: lengthVocabTable } = await page.data.supabase
    .from("vocab_table")
    .select("*", { count: "exact", head: true });

  if (!lengthVocabTable || lengthVocabTable % 200 === 0) {
    getTotalMemories();
    return;
  }

  if (lengthVocabTable < 200) {
    getTotalMemories();
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

  if (lastError) {
    addToast({
      type: "error",
      title: "Error!",
      message: lastError.message as string,
    });
  }
  getTotalMemories();
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
  model,
}: WeatherQueryParams) => {
  const url = `/server/getopenmeteo?lat=${latitude}&lon=${longitude}&unit=${tempUnit}&model=${model}`;
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  }
  return undefined;
};
