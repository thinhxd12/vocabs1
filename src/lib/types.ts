import type { Database } from "./utils/supabase";

export type DBSelect = {
  [P in keyof Database["public"]["Tables"]]: Database["public"]["Tables"][P]["Row"];
} & {
  [P in keyof Database["public"]["Views"]]: Database["public"]["Views"][P]["Row"];
};

export type DBInsert = {
  [P in keyof Database["public"]["Tables"]]: Database["public"]["Tables"][P]["Insert"];
};

export interface VocabularySearchType {
  id: string;
  word: string;
}

export interface VocabType {
  id: string;
  word: string;
  phonetics: string;
  number: number;
  audio: string;
  meanings: VocabMeaningType[];
}

export interface VocabMeaningType {
  partOfSpeech: string;
  definitions: VocabDefinitionsType[];
  synonyms: string[];
  translation: string[];
}

export interface VocabDefinitionsType {
  image: string;
  hash: string;
  definition: VocabDefinitionType[];
  example: VocabExampleType;
}

export interface VocabDefinitionType {
  num: string;
  sense: string;
  letter: string;
}

export interface VocabExampleType {
  sentence: string;
  author: string;
  title: string;
  year: string;
}

export interface CalendarDayType {
  date: number;
  month: number;
  year: number;
  count: number;
}

export interface ArtImageType {
  mainImage: string;
  shareDate: string;
  title: string;
  attr: string;
  authorImage: string;
  author: string;
  authorYears: string;
  content: string;
  nextImageUrl: string;
}

export interface TranslateType {
  definitions: Object;
  examples: Array<any>;
  translation: string;
  translationTranscription: string | null;
  translations: { [key: string]: any[] };
  word: string;
  wordTranscription: string;
}

export interface CurrentlyWeatherType {
  apparentTemperature: number;
  isDayTime: boolean;
  humidity: number;
  temperature: number;
  uvIndex: number;
  icon: number;
  windDirection: number;
  windSpeed: number;
}

export interface HourlyWeatherType {
  time: string;
  temperature: number;
  icon: string;
  probability: number;
  isDayTime: boolean;
}

export interface MinutelyWeatherType {
  time: number;
  precipIntensity: number;
  precipProbability: number;
  precipIntensityError: number;
  precipType: string;
}

export interface FixMinutelyTWeatherType {
  diffTime: number;
  intensity: number;
  probability: number;
}

export interface WeatherCodeData {
  [key: string]: {
    day: {
      description: string;
      image: string;
    };
    night: {
      description: string;
      image: string;
    };
    textdescription: string;
  };
}

export type BookDetailType = {
  title: string | null;
  authors: string[];
  coverImage: string | null;
  rating: string | null;
  numberOfRatings: string | null;
  numberOfReviews: string | null;
  series: string | null;
  genres: string[];
  description: string | null;
  firstPublished: string | null;
  numberOfPages: string | null;
};

export type BookPageContentType = {
  id: number;
  flip: boolean;
  front: string;
  back: string;
};

export type TomorrowWeatherCurrentType = {
  cloudBase: number;
  cloudCeiling: number;
  cloudCover: number;
  dewPoint: number;
  freezingRainIntensity: number;
  humidity: number;
  precipitationProbability: number;
  pressureSurfaceLevel: number;
  rainIntensity: number;
  hailProbability: number;
  pressureSeaLevel: number;
  hailSize: number;
  sleetIntensity: number;
  snowIntensity: number;
  temperature: number;
  temperatureApparent: number;
  uvHealthConcern: number;
  uvIndex: number;
  visibility: number;
  weatherCode: number;
  windDirection: number;
  windGust: number;
  windSpeed: number;
};

export interface Location {
  id: number; // Open-Meteo location ID (for identifying search results)
  name: string;
  latitude: number; // Used in URL generation for precise location lookup
  longitude: number; // Used in URL generation for precise location lookup
  admin1?: string;
  country: string;
  display: string; // Formatted display string like "Enterprise, Alabama, United States"
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    visibility: number;
    pressure_msl: number;
    dew_point_2m: number;
    cloud_cover: number;
    rain: number;
    showers: number;
    snowfall: number;
    snow_depth: number;
    is_day: number;
    us_aqi: number;
    uv_index: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
  };
}

export interface OpenMeteoGeocodeResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  feature_code: string;
  country_code: string;
  country: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  population?: number;
}

export interface OpenMeteoGeocodeResponse {
  results?: OpenMeteoGeocodeResult[];
  generationtime_ms: number;
}

export interface WeatherQueryParams {
  latitude: number;
  longitude: number;
  tempUnit: "c" | "f";
}

export interface VideoBackgroundType {
  label: string;
  value: string;
}

export type ImageBackgroundType = {
  title: string;
  url: string;
  place: string;
};
