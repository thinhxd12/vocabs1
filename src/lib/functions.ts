import { toast } from "svelte-sonner";
import type { LayoutData } from "../routes/$types";
import type { CurrentlyWeatherType, HourlyWeatherType } from "./types";
import { v7 as uuidv7 } from "uuid";
import { totalMemories } from "$lib/store/navstore";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  lon: number
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
  lon: number
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

export const archiveVocab = async (
  id: string,
  word: string,
  supabase: SupabaseClient
) => {
  const { error: errorMemories } = await supabase
    .from("memories_table")
    .insert({ id: uuidv7(), word: word });

  if (errorMemories) {
    toast.error(errorMemories.details as string, {
      class: "my-toast",
    });
    return;
  }

  const { error: errorDeleteVocab } = await supabase
    .from("vocab_table")
    .delete()
    .eq("id", id);

  if (errorDeleteVocab) {
    toast.error(errorDeleteVocab.details as string, {
      class: "my-toast",
    });
    return;
  }
  const { count: lengthVocabTable } = await supabase
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
  const { data: rangeResults } = await supabase
    .from("vocab_table")
    .select("id,number")
    .order("id", { ascending: true })
    .range(endOfIndex, endOfIndex + lengthVocabTable - 1);

  if (!rangeResults) return;
  const smallestRow = rangeResults.reduce(
    (min, row) => (row.number < min.number ? row : min),
    rangeResults[0]
  );

  const { error: lastError } = await supabase
    .from("vocab_table")
    .update({ id: id })
    .eq("id", smallestRow.id);

  if (!lastError) totalMemories.update((n) => n + 1);
};
