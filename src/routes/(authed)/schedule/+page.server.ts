import { fail, type ActionResult } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { REPETITION_PATTERN } from "../../../lib/utils/constants";
import type { DBInsert } from "$lib/types";
import { v7 as uuidv7 } from "uuid";

export const actions = {
  setProgress: async ({ cookies, request, locals: { supabase } }) => {
    const formData = await request.formData();
    const count0 = formData.get("count0") as string;
    const count1 = formData.get("count1") as string;
    const date0 = formData.get("date0") as string;
    const date1 = formData.get("date1") as string;
    const id0 = formData.get("id0") as string;
    const id1 = formData.get("id1") as string;

    if (count0 === "" || count1 === "" || id0 === "" || id1 === "") {
      return fail(422, {
        error: "Invalid data",
      });
    }

    try {
      await supabase
        .from("schedule_table")
        .update({ date: date0 ? new Date(date0) : null, count: Number(count0) })
        .eq("id", id0);

      await supabase
        .from("schedule_table")
        .update({ date: date1 ? new Date(date1) : null, count: Number(count1) })
        .eq("id", id1);
    } catch (error) {
      return fail(422, { error: "Update error" });
    }
    return {
      type: "success",
      status: 200,
      data: {
        message: "Edit successfully",
        start: { id: id0, date: date0, count: count0 },
        end: { id: id1, date: date1, count: count1 },
      },
    } as ActionResult;
  },
  setSchedule: async ({ request, locals: { supabase } }) => {
    const { data: lastProgress } = await supabase
      .from("progress_table")
      .select("*")
      .order("id", { ascending: false })
      .limit(1);
    const lastWeekIndex = lastProgress[0].index;
    const { count: lengthVocabTable } = await supabase
      .from("vocab_table")
      .select("*", { count: "exact", head: true });

    await supabase.from("schedule_table").delete().gte("count", 0);

    const limitStartIndex = Math.floor(lengthVocabTable / 200);

    const currentPatternArr = REPETITION_PATTERN.filter(
      (item) => item < limitStartIndex * 200
    );

    function findNextElement(arr: Array<number>, currentElement: number) {
      const currentIndex = arr.indexOf(currentElement);
      const nextIndex = (currentIndex + 1) % arr.length;
      return arr[nextIndex];
    }

    let thisWeekIndex = 0;
    if (lengthVocabTable >= 200)
      thisWeekIndex = findNextElement(currentPatternArr, lastWeekIndex);

    let pattern = [0, 100, 50, 150];
    if (lengthVocabTable <= 100) pattern = [0, 50, 0, 50];
    if (lengthVocabTable <= 50) pattern = [0, 0, 0, 0];

    for (let i = 0; i < 12; i++) {
      const row: DBInsert["schedule_table"] = {
        id: uuidv7(),
        index: thisWeekIndex + pattern[i % pattern.length],
      };
      const { error } = await supabase.from("schedule_table").insert(row);
      if (error) throw fail(422, { error: "Error" });
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
