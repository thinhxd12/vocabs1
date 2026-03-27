import { page } from "$app/state";
import { format } from "date-fns";
import { get, writable } from "svelte/store";
import { renderWord } from "$lib/store/vocabstore";
import type { DBInsert, DBSelect } from "$lib/types";
import { v7 as uuidv7 } from "uuid";
import { archiveVocab, shuffle } from "$lib/utils/functions";
import cloverImage from "$lib/assets/images/clover.webp";
import { goto } from "$app/navigation";
import { addToast } from "./layoutstore";

export const showTimer = writable<boolean>(false);
export const totalMemories = writable<number>(0);
export const wakeEnable = writable<boolean>(false);
export const currentProgress = writable<number>(0);

export const todaySchedule = writable<
  | {
      first: DBSelect["schedule_table"];
      second: DBSelect["schedule_table"];
    }
  | undefined
>(undefined);
export const listContent = writable<DBSelect["vocab_table"][]>([]);
export const schedule = writable<DBSelect["schedule_table"][] | undefined>(
  undefined,
);

export const listCount = writable<number>(0);
export const quizRender = writable<DBSelect["vocab_table"] | undefined>(
  undefined,
);

const todayDate = format(new Date(), "yyyy-MM-dd");

export async function getTotalMemories() {
  const { count } = await page.data.supabase
    .from("memories_table")
    .select("*", { count: "exact", head: true });
  if (count) totalMemories.set(count);
}

export async function getSchedule() {
  const { data } = await page.data.supabase
    .from("schedule_table")
    .select("*")
    .order("id", { ascending: true });
  if (data) schedule.set(data);
}

export function getTodaySchedule() {
  const scheduleValue = get(schedule);
  if (scheduleValue) {
    let index = scheduleValue.findIndex(
      (item) => item.date === todayDate || item.date === null,
    );

    if (index > -1) {
      todaySchedule.set({
        first: scheduleValue[index],
        second: scheduleValue[index + 1],
      });
    }
  }
}

export function getCurrentProgressSchedule() {
  const currentProgressValue = get(currentProgress);
  const todayScheduleValue = get(todaySchedule);
  if (currentProgressValue === 2) {
    return todayScheduleValue!.second;
  }
  if (currentProgressValue === 1) {
    return todayScheduleValue!.first;
  }
}

export function getNextProgressSchedule() {
  const currentProgressValue = get(currentProgress);
  const todayScheduleValue = get(todaySchedule);
  if (currentProgressValue >= 1) {
    return todayScheduleValue!.second;
  }
  if (currentProgressValue >= 2) {
    return todayScheduleValue!.first;
  }
}

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
  const nextProgressScheduleValue = getNextProgressSchedule();
  const notification = new Notification("Countdown Finished!", {
    requireInteraction: true,
    body: nextProgressScheduleValue
      ? String(nextProgressScheduleValue.count + 1)
      : "",
    icon: cloverImage,
    // icon: "https://cdn-icons-png.flaticon.com/512/2617/2617511.png",
  });
  notification.onclose = async () => {
    await handleCloseNotification();
  };
}

async function handleCloseNotification() {
  const currentProgressValue = get(currentProgress);

  if (currentProgressValue === 3) {
    await goto("/vocab");
    currentProgress.set(1);
    await handleGetListContent();
    startLearningWord();
  } else handleGetListContent();
}

export async function handleGetListContent() {
  const currentProgressSchedule = getCurrentProgressSchedule();
  if (!currentProgressSchedule) return;
  listCount.set(0);
  listContent.set([]);

  const { data } = await page.data.supabase
    .from("vocab_table")
    .select("*")
    .order("id", { ascending: true })
    .range(currentProgressSchedule.index, currentProgressSchedule.index + 49);
  if (data.length) {
    const content = shuffle(data) as DBSelect["vocab_table"][];
    listContent.set(content);
  }
}

// -------------------AUTOPLAY START-------------------- //

export function startLearningWord() {
  const listContentValue = get(listContent);
  renderWord.set(listContentValue[0]);
}

// handlecheck
export async function handleCheckWord(word: DBSelect["vocab_table"]) {
  if (word.number > 1) {
    const { error } = await page.data.supabase
      .from("vocab_table")
      .update({ number: word.number - 1 })
      .eq("id", word.id);
    if (error)
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
  } else {
    await archiveVocab(word.id, word.word);
  }
}

export async function updateTodayScheduleLocal() {
  const currentProgressSchedule = getCurrentProgressSchedule();
  if (!currentProgressSchedule) return;

  const { data } = await page.data.supabase
    .from("schedule_table")
    .select("count")
    .eq("id", currentProgressSchedule.id);
  if (data.length == 0) return;
  const currentCount = data[0].count;

  if (currentProgressSchedule.date === null) {
    const { data } = await page.data.supabase
      .from("schedule_table")
      .update({
        date: new Date(todayDate),
        count: currentCount + 1,
      })
      .eq("id", currentProgressSchedule.id);
  } else {
    const { data } = await page.data.supabase
      .from("schedule_table")
      .update({ count: currentCount + 1 })
      .eq("id", currentProgressSchedule.id);
  }

  await getSchedule();
  getTodaySchedule();

  const newTodayScheduleValue = get(todaySchedule);
  const currentProgressValue = get(currentProgress);

  if (currentProgressValue === 1) {
    if (newTodayScheduleValue!.first.count < 12) showTimer.set(true);
    await goto("/quiz");
    currentProgress.set(2);
    handleGetListContent();
  } else if (currentProgressValue === 2) {
    currentProgress.set(3);
  }

  if (
    newTodayScheduleValue!.first.count > 11 &&
    newTodayScheduleValue!.second.count > 11
  ) {
    if (get(currentProgress) === 3) currentProgress.set(0);
    checkSchedule();
  }
}

type ResultType = {
  index: number;
  start: Date | null;
  end: Date | null;
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

  let result: ResultType = {
    index: -1,
    start: null,
    end: null,
  };

  const allDone = schedule.every(
    (item: DBSelect["schedule_table"]) => item.date !== null,
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
