import type { Database } from "./supabase";

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

export interface LayoutImageType {
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

export type BackgroundImageType = {
  title: string;
  url: string;
};

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

export type BookSearchType = {
  title: string | null;
  authors: any[];
  coverImage: string | null;
  detailsUrl: string | null;
  goodreadsId: string | null;
  publishedYear: string | null;
  averageRating: string | null;
  numberOfRatings: string | null;
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
