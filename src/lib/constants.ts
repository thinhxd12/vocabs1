import type { WeatherCodeData } from "./types";

export function getElText(doc: any, query: string, defaultText: string) {
  const el = doc.querySelector(query);
  return (
    (el?.textContent &&
      el.textContent.replace(/[\n\r]+|\s{2,}/g, " ").trim()) ||
    defaultText
  );
}

export function getElAttribute(doc: any, query: string, attr: string) {
  const el = doc.querySelector(query);
  return (el && el.getAttribute(attr)) || "";
}

export const chunk = (array: any[], size: number) =>
  array.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(array.slice(i, i + size));
    return acc;
  }, []);

export const URL_IMAGE_MAIN_PAGE =
  "https://www.getdailyart.com/en/21/paul-signac/the-red-buoy-saint-tropez";

export const DEFAULT_CORS_PROXY = "https://mywebapp.abcworker.workers.dev/";

export const mapTables = {
  vocabulary: "vocabulary",
  schedule: "schedule",
  history: "history",
  memories: "memories",
  bookmarks: "bookmarks",
  weather: "weather",
  progress: "progress",
};

export const PRECIPITATION_PROBABILITY = 0.65;
export const ACCUMULATION = 0.03;
export const DEVIATION_NUMB = 0;

export const REPETITION_PATTERN = [
  0, 400, 800, 200, 600, 1400, 1000, 1600, 1200, 1800,
];

export const WMOCODE: WeatherCodeData = {
  "0": {
    day: {
      description: "Sunny Day",
      image: "/openmeteo/icons/01d.svg",
    },
    night: {
      description: "Clear",
      image: "/openmeteo/icons/01n.svg",
    },
    textdescription: "/openmeteo/weather/clear.webp",
  },
  "1": {
    day: {
      description: "Mainly Sunny",
      image: "/openmeteo/icons/02d.svg",
    },
    night: {
      description: "Mainly Clear",
      image: "/openmeteo/icons/02n.svg",
    },
    textdescription: "/openmeteo/weather/clear.webp",
  },
  "2": {
    day: {
      description: "Partly Cloudy",
      image: "/openmeteo/icons/03d.svg",
    },
    night: {
      description: "Partly Cloudy",
      image: "/openmeteo/icons/03n.svg",
    },
    textdescription: "/openmeteo/weather/partly-cloudy.webp",
  },
  "3": {
    day: {
      description: "Mostly Cloudy",
      image: "/openmeteo/icons/04.svg",
    },
    night: {
      description: "Mostly Cloudy",
      image: "/openmeteo/icons/04.svg",
    },
    textdescription: "/openmeteo/weather/cloudy.webp",
  },
  "45": {
    day: {
      description: "Foggy",
      image: "/openmeteo/icons/15.svg",
    },
    night: {
      description: "Foggy",
      image: "/openmeteo/icons/15.svg",
    },
    textdescription: "/openmeteo/weather/foggy.webp",
  },
  "48": {
    day: {
      description: "Rime Fog",
      image: "/openmeteo/icons/15.svg",
    },
    night: {
      description: "Rime Fog",
      image: "/openmeteo/icons/15.svg",
    },
    textdescription: "/openmeteo/weather/foggy.webp",
  },
  "51": {
    day: {
      description: "Light Drizzle",
      image: "/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Drizzle",
      image: "/openmeteo/icons/46.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "53": {
    day: {
      description: "Drizzle",
      image: "/openmeteo/icons/46.svg",
    },
    night: {
      description: "Drizzle",
      image: "/openmeteo/icons/46.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "55": {
    day: {
      description: "Heavy Drizzle",
      image: "/openmeteo/icons/09.svg",
    },
    night: {
      description: "Heavy Drizzle",
      image: "/openmeteo/icons/09.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "56": {
    day: {
      description: "Light Freezing Drizzle",
      image: "/openmeteo/icons/47.svg",
    },
    night: {
      description: "Light Freezing Drizzle",
      image: "/openmeteo/icons/47.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "57": {
    day: {
      description: "Freezing Drizzle",
      image: "/openmeteo/icons/49.svg",
    },
    night: {
      description: "Freezing Drizzle",
      image: "/openmeteo/icons/49.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "61": {
    day: {
      description: "Light Rain",
      image: "/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Rain",
      image: "/openmeteo/icons/46.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "63": {
    day: {
      description: "Rain",
      image: "/openmeteo/icons/09.svg",
    },
    night: {
      description: "Rain",
      image: "/openmeteo/icons/09.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "65": {
    day: {
      description: "Heavy Rain",
      image: "/openmeteo/icons/10.svg",
    },
    night: {
      description: "Heavy Rain",
      image: "/openmeteo/icons/10.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "66": {
    day: {
      description: "Light Freezing Rain",
      image: "/openmeteo/icons/47.svg",
    },
    night: {
      description: "Light Freezing Rain",
      image: "/openmeteo/icons/47.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "67": {
    day: {
      description: "Freezing Rain",
      image: "/openmeteo/icons/12.svg",
    },
    night: {
      description: "Freezing Rain",
      image: "/openmeteo/icons/12.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "71": {
    day: {
      description: "Light Snow",
      image: "/openmeteo/icons/49.svg",
    },
    night: {
      description: "Light Snow",
      image: "/openmeteo/icons/49.svg",
    },
    textdescription: "/openmeteo/weather/snow.webp",
  },
  "73": {
    day: {
      description: "Snow",
      image: "/openmeteo/icons/13.svg",
    },
    night: {
      description: "Snow",
      image: "/openmeteo/icons/13.svg",
    },
    textdescription: "/openmeteo/weather/snow.webp",
  },
  "75": {
    day: {
      description: "Heavy Snow",
      image: "/openmeteo/icons/50.svg",
    },
    night: {
      description: "Heavy Snow",
      image: "/openmeteo/icons/50.svg",
    },
    textdescription: "/openmeteo/weather/snow.webp",
  },
  "77": {
    day: {
      description: "Snow Grains",
      image: "/openmeteo/icons/49.svg",
    },
    night: {
      description: "Snow Grains",
      image: "/openmeteo/icons/49.svg",
    },
    textdescription: "/openmeteo/weather/snow.webp",
  },
  "80": {
    day: {
      description: "Light Showers",
      image: "/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Showers",
      image: "/openmeteo/icons/46.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "81": {
    day: {
      description: "Showers",
      image: "/openmeteo/icons/09.svg",
    },
    night: {
      description: "Showers",
      image: "/openmeteo/icons/09.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "82": {
    day: {
      description: "Heavy Showers",
      image: "/openmeteo/icons/10.svg",
    },
    night: {
      description: "Heavy Showers",
      image: "/openmeteo/icons/10.svg",
    },
    textdescription: "/openmeteo/weather/rain.webp",
  },
  "85": {
    day: {
      description: "Light Snow Showers",
      image: "/openmeteo/icons/49.svg",
    },
    night: {
      description: "Light Snow Showers",
      image: "/openmeteo/icons/49.svg",
    },
    textdescription: "/openmeteo/weather/snow.webp",
  },
  "86": {
    day: {
      description: "Snow Showers",
      image: "/openmeteo/icons/13.svg",
    },
    night: {
      description: "Snow Showers",
      image: "/openmeteo/icons/13.svg",
    },
    textdescription: "/openmeteo/weather/snow.webp",
  },
  "95": {
    day: {
      description: "Thunderstorm",
      image: "/openmeteo/icons/11.svg",
    },
    night: {
      description: "Thunderstorm",
      image: "/openmeteo/icons/11.svg",
    },
    textdescription: "/openmeteo/weather/thunderstorm.webp",
  },
  "96": {
    day: {
      description: "Light Thunderstorms With Hail",
      image: "/openmeteo/icons/20d.svg",
    },
    night: {
      description: "Light Thunderstorms With Hail",
      image: "/openmeteo/icons/20n.svg",
    },
    textdescription: "/openmeteo/weather/thunderstorm.webp",
  },
  "99": {
    day: {
      description: "Thunderstorm With Hail",
      image: "/openmeteo/icons/27d.svg",
    },
    night: {
      description: "Thunderstorm With Hail",
      image: "/openmeteo/icons/27n.svg",
    },
    textdescription: "/openmeteo/weather/thunderstorm-hail.webp",
  },
};

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  animation: {
    duration: 0,
  },
  stacked: false,
  plugins: {
    title: {
      display: false,
    },
    legend: { display: false },
  },
  scales: {
    x: {
      border: {
        display: false,
      },
      grid: {
        display: true,
        drawOnChartArea: false,
        drawTicks: true,
        tickLength: 1,
        tickWidth: 1,
        tickColor: "#818181",
      },
      ticks: {
        stepSize: 0.2,
        callback: function (value: any, index: any) {
          return value === 0 ? "Now" : value % 10 === 0 ? value + "m" : null;
        },
        font: {
          size: 9,
          family: "SF Pro Display",
        },
        color: "white",
      },
    },
    y: {
      type: "linear" as const,
      display: true,
      position: "left" as const,
      min: 0,
      max: 1.5,
      border: { dash: [2, 2] },
      grid: {
        drawTicks: false,
        color: ["transparent", "#818181", "#818181"],
      },
      ticks: {
        stepSize: 0.5,
        callback: function (value: any, index: any) {
          switch (value) {
            case 0:
              return "";
            case 0.5:
              return "";
            case 1:
              return "";
            default:
              null;
          }
        },
        font: {
          size: 10,
          weight: "normal",
        },
        color: "white",
        padding: 3,
      },
    },
    y1: {
      min: 0,
      max: 1,
      type: "linear" as const,
      display: true,
      position: "right" as const,
      grid: {
        display: true,
        drawOnChartArea: false,
        tickLength: 3,
        tickWidth: 1,
      },
      ticks: {
        stepSize: 0.25,
        callback: function (value: any, index: any) {
          return null;
        },
        font: {
          size: 9,
        },
        color: "white",
      },
    },
  },
};

type TomorrowConditionsType = {
  [key: string]: {
    name: string;
    iconName: string;
    background: string;
    backgroundNight: string;
  };
};

export const TOMORROW_CONDITIONS: TomorrowConditionsType = {
  "0": {
    name: "Unknown",
    iconName: "unknown",
    backgroundNight: "",
    background: "",
  },
  "1000": {
    name: "Clear",
    iconName: "clear",
    background: "/navweather/clear-day.webp",
    backgroundNight: "/navweather/clear-night.webp",
  },
  "1100": {
    name: "Mostly Clear",
    iconName: "mostly_clear",
    background: "/navweather/clear-day.webp",
    backgroundNight: "/navweather/clear-night.webp",
  },
  "1101": {
    name: "Partly Cloudy",
    iconName: "partly_cloudy",
    background: "/navweather/partly-cloudy.webp",
    backgroundNight: "/navweather/partly-cloudy.webp",
  },
  "1102": {
    name: "Mostly Cloudy",
    iconName: "mostly_cloudy",
    background: "/navweather/cloudy.webp",
    backgroundNight: "/navweather/cloudy.webp",
  },
  "1001": {
    name: "Cloudy",
    iconName: "cloudy",
    background: "/navweather/cloudy.webp",
    backgroundNight: "/navweather/cloudy.webp",
  },
  "2000": { name: "Fog", iconName: "fog", backgroundNight: "", background: "" },
  "2100": {
    name: "Light Fog",
    iconName: "fog_light",
    background: "/navweather/foggy.webp",
    backgroundNight: "/navweather/foggy.webp",
  },
  "4000": {
    name: "Drizzle",
    iconName: "drizzle",
    background: "/navweather/rain.webp",
    backgroundNight: "/navweather/rain.webp",
  },
  "4001": {
    name: "Rain",
    iconName: "rain",
    background: "/navweather/rain.webp",
    backgroundNight: "/navweather/rain.webp",
  },
  "4200": {
    name: "Light Rain",
    iconName: "rain_light",
    background: "/navweather/rain.webp",
    backgroundNight: "/navweather/rain.webp",
  },
  "4201": {
    name: "Heavy Rain",
    iconName: "rain_heavy",
    background: "/navweather/rain.webp",
    backgroundNight: "/navweather/rain.webp",
  },
  "5000": {
    name: "Snow",
    iconName: "snow",
    background: "/navweather/snow.webp",
    backgroundNight: "/navweather/snow.webp",
  },
  "5001": {
    name: "Flurries",
    iconName: "flurries",
    background: "/navweather/snow.webp",
    backgroundNight: "/navweather/snow.webp",
  },
  "5100": {
    name: "Light Snow",
    iconName: "snow_light",
    background: "/navweather/snow.webp",
    backgroundNight: "/navweather/snow.webp",
  },
  "5101": {
    name: "Heavy Snow",
    iconName: "snow_heavy",
    background: "/navweather/snow.webp",
    backgroundNight: "/navweather/snow.webp",
  },
  "6000": {
    name: "Freezing Drizzle",
    iconName: "freezing_rain_drizzle",
    background: "/navweather/rain.webp",
    backgroundNight: "/navweather/rain.webp",
  },
  "6001": {
    name: "Freezing Rain",
    iconName: "freezing_rain",
    background: "/navweather/rain.webp",
    backgroundNight: "/navweather/rain.webp",
  },
  "6200": {
    name: "Light Freezing Rain",
    iconName: "freezing_rain_light",
    background: "/navweather/rain.webp",
    backgroundNight: "/navweather/rain.webp",
  },
  "6201": {
    name: "Heavy Freezing Rain",
    iconName: "freezing_rain_heavy",
    background: "/navweather/rain.webp",
    backgroundNight: "/navweather/rain.webp",
  },
  "7000": {
    name: "Ice Pellets",
    iconName: "ice_pellets",
    background: "/navweather/snow.webp",
    backgroundNight: "/navweather/snow.webp",
  },
  "7101": {
    name: "Heavy Ice Pellets",
    iconName: "ice_pellets_heavy",
    background: "/navweather/snow.webp",
    backgroundNight: "/navweather/snow.webp",
  },
  "7102": {
    name: "Light Ice Pellets",
    iconName: "ice_pellets_light",
    background: "/navweather/snow.webp",
    backgroundNight: "/navweather/snow.webp",
  },
  "8000": {
    name: "Thunderstorm",
    iconName: "tstorm",
    background: "/navweather/thunderstorm.webp",
    backgroundNight: "/navweather/thunderstorm.webp",
  },
};
