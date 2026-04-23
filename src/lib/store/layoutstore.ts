import type {
  Card,
  LocationType,
  OpenMeteoResponse,
  ToastType,
  YearProgressType,
} from "$lib/types";
import { writable } from "svelte/store";
import type { BookDetailType, HighlightType } from "../types";

export const highlight = writable<HighlightType | undefined>();
export const currentHighlightId = writable<string>("");
export const bookInfo = writable<BookDetailType | undefined>();

export const currentMode = writable<"focus" | "shortbreak" | "longbreak">(
  "focus",
);
export const currentInterval = writable<number>(1);
export const secondsRemaining = writable<number>(7 * 60);
export const focusMinutes = writable<number>(7);
export const shortbreakMinutes = writable<number>(2);
export const longbreakMinutes = writable<number>(15);
export const intervals = writable<number>(3);
export const isMuted = writable<boolean>(false);
export const isPaused = writable<boolean>(true);
export const isFocusDone = writable<boolean>(false);

export const locationList = writable<LocationType[]>([]);
export const currentLocationId = writable<string>("");
export const currentForecastModel = writable<string>("");
export const weatherData = writable<OpenMeteoResponse | undefined>(undefined);

export const yearProgressList = writable<YearProgressType[]>([]);

const defaultToast: ToastType = {
  showToast: false,
  title: "",
  message: "",
  timeout: 5000,
  type: "info",
};

export const toast = writable<ToastType>(defaultToast);

export const addToast = ({
  showToast = true,
  title,
  message,
  type,
  timeout = 5000,
}: ToastType) => {
  toast.update((item) => ({
    ...item,
    showToast,
    title,
    message,
    type,
    timeout,
  }));
};

export const listCardContent = writable<Card[]>([]);
export const listCardCount = writable<number>(0);
