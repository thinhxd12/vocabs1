import { goto } from "$app/navigation";
import type { CurrentlyWeatherType, HourlyWeatherType } from "./types";

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
  lat: string,
  lon: string
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
  lat: string,
  lon: string
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

export async function logout() {
  const res = await fetch("/server/logout", { method: "POST" });
  const data = await res.json();
  if (data.redirectTo) {
    localStorage.removeItem("login_time");
    goto(data.redirectTo);
  }
}
