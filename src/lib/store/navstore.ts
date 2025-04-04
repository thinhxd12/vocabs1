import { page } from "$app/state";
import type {
  SelectSchedule,
  SelectVocab,
  SelectWeather,
} from "$lib/db/schema";
import arrayShuffle from "array-shuffle";
import { format } from "date-fns";
import { get, writable } from "svelte/store";
import { renderWord } from "$lib/store/vocabstore";

export const isAutoPlay = writable<boolean>(false);
export const showWeather = writable<boolean>(false);
export const showTimer = writable<boolean>(false);
export const totalMemories = writable<number>(0);
export const todaySchedule = writable<
  | {
      start: SelectSchedule;
      end: SelectSchedule;
    }
  | undefined
>(undefined);
export const locationList = writable<SelectWeather[]>([]);
export const listContent = writable<SelectVocab[]>([]);
export const currentSchedule = writable<SelectSchedule | undefined>(undefined);
export const listCount = writable<number>(0);
export const quizRender = writable<SelectVocab | undefined>(undefined);
export const vocabInput = writable<string>("");

const todayDate = format(new Date(), "yyyy-MM-dd");

export function sendNotification() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      notificationAlert();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          notificationAlert();
        }
      });
    }
  }
}

function notificationAlert() {
  const currentScheduleValue = get(currentSchedule);
  const notification = new Notification("Countdown Finished!", {
    requireInteraction: true,
    body: currentScheduleValue
      ? `${currentScheduleValue.count + 1}`
      : "No current schedule.",
    icon: "https://cdn-icons-png.flaticon.com/512/2617/2617511.png",
  });
  notification.onclose = async () => {
    handleAutoplay();
  };
}

export function handleGetListContent() {
  const schedule = get(currentSchedule);
  if (!schedule) return;
  const index = schedule.index;
  if (page.url.pathname === "/vocab") {
    handleGetListContentVocab(index);
    return;
  } else if (page.url.pathname === "/quiz") {
    handleGetListContentQuiz(index);
    return;
  } else {
    listContent.set([]);
    isAutoPlay.set(false);
  }
}

const handleGetListContentVocab = async (index: number) => {
  const response = await fetch(`/server/getwordlist?index=${index}`);
  if (response.status === 200) {
    listContent.set(await response.json());
    isAutoPlay.set(true);
  }
};

const handleGetListContentQuiz = async (index: number) => {
  quizRender.set(undefined);
  const response = await fetch(`/server/getwordlist?index=${index}`);
  if (response.status === 200) {
    const data = (await response.json()) as SelectVocab[];
    const content = arrayShuffle(data);
    listContent.set(content);
    isAutoPlay.set(false);
    quizRender.set(content[0]);
  }
};

// -------------------AUTOPLAY START-------------------- //

let intervalAutoplay: ReturnType<typeof setInterval>;

const handleRenderWord = async () => {
  const listContentValue = get(listContent);

  listCount.update((n) => {
    const value = listContentValue[n];
    handleCheckWord(value);
    renderWord.set(value);
    vocabInput.set(value.word);
    return n + 1;
  });
};

// handlecheck
const handleCheckWord = async (word: SelectVocab) => {
  if (word.number > 1) {
    fetch(`/server/checkword?id=${word.id}`);
  } else {
    const response = await fetch(
      `/server/archiveword?word=${word.word}&id=${word.id}`
    );
    if (response.status == 201) totalMemories.update((n) => n + 1);
  }
};

const startAutoplay = async () => {
  clearInterval(intervalAutoplay);
  const listContentValue = get(listContent);

  handleRenderWord();
  intervalAutoplay = setInterval(() => {
    const listCountValue = get(listCount);
    if (listCountValue < listContentValue.length) {
      handleRenderWord();
    } else {
      endAutoplay();
    }
  }, 6000);
};

const pauseAutoplay = () => {
  clearInterval(intervalAutoplay);
};

const endAutoplay = async () => {
  clearInterval(intervalAutoplay);
  listCount.set(0);
  renderWord.set(undefined);
  await updateTodayScheduleLocal();
  const currentScheduleValue = get(currentSchedule);
  if (currentScheduleValue && currentScheduleValue.count < 9) {
    showTimer.set(true);
  }
};

export const handleAutoplay = () => {
  const listContentValue = get(listContent);
  if (page.url.pathname === "/vocab" && listContentValue.length > 0) {
    isAutoPlay.update((n) => {
      if (n) {
        startAutoplay();
        return false;
      } else {
        pauseAutoplay();
        return true;
      }
    });
  }
};

export const updateTodayScheduleLocal = async () => {
  const currentScheduleValue = get(currentSchedule);
  const todayScheduleValue = get(todaySchedule);
  if (!currentScheduleValue || !todayScheduleValue) return;
  const response = await fetch(
    `/server/updateschedule?id=${currentScheduleValue.id}&date=${todayDate}`
  );
  const data = await response.json();
  currentSchedule.set(data);
  if (todayScheduleValue.start.id === currentScheduleValue.id) {
    todaySchedule.set({ ...todayScheduleValue, start: data });
  } else {
    todaySchedule.set({ ...todayScheduleValue, end: data });
    fetch(`/server/checkschedule`);
  }
};

// -------------------AUTOPLAY END-------------------- //
