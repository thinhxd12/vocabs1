import {
  getAllScheduleHaveDate,
  getDiary,
  getTotalProgress,
  getTotalProgressByIndex,
} from "$lib/db/queries/select";
import {
  progressTable,
  scheduleTable,
  vocabTable,
  type InsertSchedule,
  type SelectProgress,
  type SelectSchedule,
} from "$lib/db/schema";

export const load: PageServerLoad = async ({ cookies }) => {
  const data = await getAllScheduleHaveDate();
  const transformed = data.reduce((acc: any, curr: SelectSchedule) => {
    const dateObj = new Date(curr.date!);
    const day = dateObj.getDate();
    const month = dateObj.getMonth();

    const existing = acc.find(
      (item: any) => item.date === day && item.month === month
    );

    if (existing) {
      existing.count += curr.count;
    } else {
      acc.push({ date: day, month: month, count: curr.count });
    }

    return acc;
  }, []);

  const progressLength = await getTotalProgress();
  let index =
    progressLength % 5 === 0
      ? progressLength / 5 - 1
      : Math.floor(progressLength / 5);
  const progress = await getTotalProgressByIndex(index);
  const diary = await getDiary();

  return {
    schedule: transformed,
    progressLength: index,
    progress: progress as SelectProgress[],
    diary: diary,
  };
};

import { fail, type ActionResult } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { updateCountScheduleById } from "$lib/db/queries/update";
import { db } from "$lib/db";
import { count, asc, eq, desc, DrizzleError } from "drizzle-orm";
import { REPETITION_PATTERN } from "$lib/constants";
import { insertSchedule } from "$lib/db/queries/insert";

export const actions = {
  setProgress: async ({ cookies, request }) => {
    const formData = await request.formData();
    const count0 = formData.get("count0") as string;
    const count1 = formData.get("count1") as string;
    const id0 = formData.get("id0") as string;
    const id1 = formData.get("id1") as string;

    if (count0 === "" || count1 === "" || id0 === "" || id1 === "") {
      return fail(422, {
        error: "Invalid data",
      });
    }

    try {
      await updateCountScheduleById(id0, Number(count0));
      await updateCountScheduleById(id1, Number(count1));
    } catch (error) {
      return fail(422, { error: "Update error" });
    }
    return {
      type: "success",
      status: 200,
      data: {
        message: "Edit successfully",
      },
    } as ActionResult;
  },
  setSchedule: async ({ request }) => {
    const lastProgress = await db
      .select()
      .from(progressTable)
      .orderBy(desc(progressTable.id))
      .limit(1);

    const lastWeekIndex = lastProgress[0].index;

    const lengthVocabTable = await db
      .select({ count: count() })
      .from(vocabTable);

    // delete table
    await db.delete(scheduleTable);

    const limitStartIndex = Math.floor(lengthVocabTable[0].count / 200);

    const currentPatternArr = REPETITION_PATTERN.filter(
      (item) => item < limitStartIndex * 200
    );

    function findNextElement(arr: Array<number>, currentElement: number) {
      const currentIndex = arr.indexOf(currentElement);
      const nextIndex = (currentIndex + 1) % arr.length;
      return arr[nextIndex];
    }

    let thisWeekIndex = 0;
    if (lengthVocabTable[0].count >= 200)
      thisWeekIndex = findNextElement(currentPatternArr, lastWeekIndex);

    const pattern = [0, 100, 50, 150];

    for (let i = 0; i < 12; i++) {
      const row: InsertSchedule = {
        index: thisWeekIndex + pattern[i % pattern.length],
      };
      try {
        await insertSchedule(row);
      } catch (error) {
        return fail(422, { error: "Create error" });
      }
      console.log(row);
    }
    return {
      type: "success",
      status: 200,
      data: {
        message: "Create successfully",
      },
    } as ActionResult;
  },
} satisfies Actions;
