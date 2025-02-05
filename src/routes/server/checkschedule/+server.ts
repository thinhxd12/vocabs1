import { insertProgress } from "$lib/db/queries/insert.js";
import {
  getLastProgress,
  getSchedule,
  getTotalMemories,
} from "$lib/db/queries/select";
import type { InsertProgress } from "$lib/db/schema";
import { error } from "@sveltejs/kit";

export async function GET({ url }) {
  try {
    const schedule = await getSchedule();
    const lastProgress = await getLastProgress();
    if (!schedule) error(400, "Error");
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
    const allDone = schedule.every((item) => item.date !== null);

    if (allDone && lastProgress) {
      result = {
        index: schedule[0].index,
        start: schedule[0].date,
        end: schedule[schedule.length - 1].date,
      };

      if (String(result.start) !== String(lastProgress.start_date)) {
        const insertData: InsertProgress = {
          index: result.index,
          start_date: new Date(result.start!),
          end_date: new Date(result.end!),
        };
        await insertProgress(insertData);
      }
    }
    return new Response(JSON.stringify(result));
  } catch (e) {
    error(404);
  }
}
