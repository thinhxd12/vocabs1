import { page } from "$app/state";
import type {
  Card,
  LocationType,
  OpenMeteoResponse,
  ToastType,
  YearProgressType,
} from "$lib/types";
import { derived, get, writable } from "svelte/store";
import type { BookDetailType, HighlightType } from "../types";
import { minutesToSeconds } from "$lib/utils/functions";
import { getTodayDate } from "./navstore";
import { fsrs } from "ts-fsrs";

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
export const showPomodoroTimer = writable<boolean>(false);
export const percent = writable<number>(100);
export const srcAudio = writable<string>("/sounds/mp3_break.ogg");
export const pauseAudio = writable<boolean>(true);
export const timezone = writable<string>("UTC");
export const fsrsparams = writable<string>("[]");

export const scheduler = derived(fsrsparams, ($params) => {
  return fsrs({
    request_retention: 0.9,
    maximum_interval: 36500,
    enable_fuzz: true,
    enable_short_term: true,
    learning_steps: ["15m"],
    relearning_steps: ["10m"],
    w: JSON.parse($params),
  });
});

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

let interval: ReturnType<typeof setInterval>;
let now = 0;
let end = 0;

export function startTimer() {
  isPaused.set(false);
  now = Date.now();
  end = now + get(secondsRemaining) * 1000;
  clearInterval(interval);
  interval = setInterval(updateTimer, 1000);
}

export function updateTimer() {
  now = Date.now();
  secondsRemaining.set(Math.round((end - now) / 1000));
  updateDisplay();
  if (now >= end) {
    endTimer();
  }
}

export function pauseTimer() {
  clearInterval(interval);
  isPaused.set(true);
}

export function clearIntervalTimer() {
  clearInterval(interval);
}

export function endTimer() {
  percent.set(100);
  switch (get(currentMode)) {
    case "focus":
      srcAudio.set("/sounds/mp3_break.ogg");
      pauseAudio.set(false);
      if (get(currentInterval) >= get(intervals)) {
        currentMode.set("longbreak");
        secondsRemaining.set(minutesToSeconds(get(longbreakMinutes)));
      } else {
        currentMode.set("shortbreak");
        secondsRemaining.set(minutesToSeconds(get(shortbreakMinutes)));
      }
      isFocusDone.set(true);
      submitReport();
      startTimer();
      break;
    case "shortbreak":
      srcAudio.set("/sounds/mp3_focus.ogg");
      pauseAudio.set(false);
      if (get(isFocusDone)) {
        currentInterval.update((cur) => {
          if (cur + 1 > get(intervals)) {
            return 1;
          }
          return cur + 1;
        });
        isFocusDone.set(false);
      }
      currentMode.set("focus");
      secondsRemaining.set(minutesToSeconds(get(focusMinutes)));

      if (page.url.pathname === "/pomodoro") {
        startTimer();
      } else {
        isPaused.set(true);
        clearInterval(interval);
      }
      break;
    case "longbreak":
      srcAudio.set("/sounds/mp3_focus.ogg");
      pauseAudio.set(false);
      if (get(isFocusDone)) {
        currentInterval.update((cur) => {
          if (cur + 1 > get(intervals)) {
            return 1;
          }
          return cur + 1;
        });
        isFocusDone.set(false);
      }
      currentMode.set("focus");
      secondsRemaining.set(minutesToSeconds(get(focusMinutes)));

      if (page.url.pathname === "/pomodoro") {
        startTimer();
      } else {
        isPaused.set(true);
        clearInterval(interval);
      }
      break;
    default:
      break;
  }
}

export function updateDisplay() {
  switch (get(currentMode)) {
    case "focus":
      percent.set(
        Math.round((get(secondsRemaining) / get(focusMinutes) / 6) * 10),
      );
      break;
    case "shortbreak":
      percent.set(
        Math.round((get(secondsRemaining) / get(shortbreakMinutes) / 6) * 10),
      );
      break;
    case "longbreak":
      percent.set(
        Math.round((get(secondsRemaining) / get(longbreakMinutes) / 6) * 10),
      );
      break;
    default:
      break;
  }
}

async function submitReport() {
  const todayDate = getTodayDate();
  const { data } = await page.data.supabase
    .from("pomodoro_table")
    .select("time")
    .eq("date", todayDate);

  if (data && data.length) {
    const { error } = await page.data.supabase
      .from("pomodoro_table")
      .update({
        time: data[0].time + get(focusMinutes),
      })
      .eq("date", todayDate);
    if (error)
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
  } else {
    const { error } = await page.data.supabase
      .from("pomodoro_table")
      .insert({ date: todayDate, time: get(focusMinutes) });
    if (error)
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
  }
}
