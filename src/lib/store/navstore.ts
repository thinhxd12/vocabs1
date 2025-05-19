import { page } from "$app/state";
import arrayShuffle from "array-shuffle";
import { format } from "date-fns";
import { get, writable } from "svelte/store";
import { renderWord } from "$lib/store/vocabstore";
import type { DBInsert, DBSelect } from "$lib/types";
import { archiveVocab } from "$lib/functions";
import { v7 as uuidv7 } from "uuid";

export const isAutoPlay = writable<boolean>(false);
export const showWeather = writable<boolean>(false);
export const showTimer = writable<boolean>(false);
export const totalMemories = writable<number>(0);
export const todaySchedule = writable<
  | {
      start: DBSelect["schedule_table"];
      end: DBSelect["schedule_table"];
    }
  | undefined
>(undefined);
export const locationList = writable<DBSelect["weather_table"][]>([]);
export const listContent = writable<DBSelect["vocab_table"][]>([]);
export const currentSchedule = writable<DBSelect["schedule_table"] | undefined>(
  undefined
);
export const schedule = writable<DBSelect["schedule_table"][] | undefined>(
  undefined
);

export const listCount = writable<number>(0);
export const quizRender = writable<DBSelect["vocab_table"] | undefined>(
  undefined
);
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
  listCount.set(0);
  isAutoPlay.set(false);
  listContent.set([]);
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
  const { data } = await page.data.supabase
    .from("vocab_table")
    .select("*")
    .order("id", { ascending: true })
    .range(index, index + 49);
  if (data.length) {
    listContent.set(data);
    isAutoPlay.set(true);
  }
};

const handleGetListContentQuiz = async (index: number) => {
  quizRender.set(undefined);
  const { data } = await page.data.supabase
    .from("vocab_table")
    .select("*")
    .order("id", { ascending: true })
    .range(index, index + 49);

  if (data.length) {
    const content = arrayShuffle(data) as DBSelect["vocab_table"][];
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
const handleCheckWord = async (word: DBSelect["vocab_table"]) => {
  if (word.number > 1) {
    const { error } = await page.data.supabase
      .from("vocab_table")
      .update({ number: word.number - 1 })
      .eq("id", word.id);
  } else {
    await archiveVocab(word.id, word.word, page.data.supabase);
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
  let currentScheduleValue = get(currentSchedule);
  const todayScheduleValue = get(todaySchedule);
  if (!currentScheduleValue || !todayScheduleValue) return;

  const { data: currentData } = await page.data.supabase
    .from("schedule_table")
    .select()
    .eq("id", currentScheduleValue.id);
  if (currentData.length == 0) return;
  if (!currentData[0].date) {
    const { data } = await page.data.supabase
      .from("schedule_table")
      .update({ date: new Date(todayDate), count: currentData[0].count + 1 })
      .eq("id", currentScheduleValue.id)
      .select();
    currentSchedule.set(data[0]);

    schedule.update((current) => {
      return current?.map((item) => (item.id === data[0].id ? data[0] : item));
    });
  } else {
    const { data } = await page.data.supabase
      .from("schedule_table")
      .update({ count: currentData[0].count + 1 })
      .eq("id", currentScheduleValue.id)
      .select();
    currentSchedule.set(data[0]);

    schedule.update((current) => {
      return current?.map((item) => (item.id === data[0].id ? data[0] : item));
    });
  }

  if (todayScheduleValue.start.id === currentScheduleValue.id) {
    todaySchedule.set({ ...todayScheduleValue, start: get(currentSchedule)! });
  } else {
    todaySchedule.set({ ...todayScheduleValue, end: get(currentSchedule)! });
  }

  currentScheduleValue = get(currentSchedule);
  if (currentScheduleValue) {
    if (currentScheduleValue.count < 12) showTimer.set(true);
    if (currentScheduleValue.count >= 9) checkSchedule();
  }
};

async function checkSchedule() {
  const { data: schedule } = await page.data.supabase
    .from("schedule_table")
    .select("*")
    .order("id", { ascending: true });
  if (!schedule[schedule.length - 1].date) return;

  const { data: lastProgress } = await page.data.supabase
    .from("progress_table")
    .select("*")
    .order("id", { ascending: false })
    .limit(1);
  type ResultType = {
    index: number;
    start: Date | null;
    end: Date | null;
  };
  let result: ResultType = {
    index: -1,
    start: null,
    end: null,
  };
  const allDone = schedule.every(
    (item: DBSelect["schedule_table"]) => item.date !== null
  );
  if (allDone && lastProgress.length) {
    result = {
      index: schedule[0].index,
      start: schedule[0].date,
      end: schedule[schedule.length - 1].date,
    };

    if (String(result.start) !== String(lastProgress[0].start_date)) {
      const insertData: DBInsert["progress_table"] = {
        id: uuidv7(),
        index: result.index,
        start_date: new Date(result.start!),
        end_date: new Date(result.end!),
      };

      const { error } = await page.data.supabase
        .from("progress_table")
        .insert(insertData);
    }
  }
}

// -------------------AUTOPLAY END-------------------- //
