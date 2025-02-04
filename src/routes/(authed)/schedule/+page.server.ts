import {
  getAllScheduleHaveDate,
  getTotalProgress,
} from "$lib/db/queries/select";
import type { SelectSchedule } from "$lib/db/schema";

export async function load({ cookies }) {
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
  return {
    schedule: transformed,
    progressLength: Math.floor(progressLength / 5),
  };
}
