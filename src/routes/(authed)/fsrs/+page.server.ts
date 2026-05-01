import { fail, type ActionResult } from "@sveltejs/kit";
import type { Actions } from "./$types";
import {
  computeParameters,
  convertCsvToFsrsItems,
} from "@open-spaced-repetition/binding";

const timeZoneFormatterCache = new Map<string, Intl.DateTimeFormat>();

const getTimeZoneFormatter = (timeZone: string) => {
  let formatter = timeZoneFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("ia", {
      timeZone,
      timeZoneName: "shortOffset",
    });
    timeZoneFormatterCache.set(timeZone, formatter);
  }
  return formatter;
};

const getTimezoneOffset = (timeZone: string, date: Date | number) => {
  const timeZoneName = getTimeZoneFormatter(timeZone)
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;

  if (!timeZoneName || timeZoneName === "GMT" || timeZoneName === "UTC") {
    return 0;
  }

  const [, sign, hours, minutes = "0"] =
    timeZoneName.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/) ?? [];

  if (!sign || !hours) {
    throw new Error(`Unsupported time zone offset: ${timeZoneName}`);
  }

  const totalMinutes = Number(hours) * 60 + Number(minutes);
  return sign === "+" ? totalMinutes : -totalMinutes;
};

export const actions = {
  optimize: async ({ cookies, request, locals: { supabase } }) => {
    const formData = await request.formData();
    const timezone = formData.get("tz") as string;
    if (timezone === "") return fail(422, { error: "Invalid data" });

    let parameters: number[] = [];

    const { data } = await supabase.from("reviewlogs_table").select("*");

    if (data.length) {
      const header =
        "review_time,card_id,review_rating,review_duration,review_state\n";
      const rows = data
        .map(
          (log: any) =>
            `${log.review_time},${log.card_id},${log.review_rating},${log.review_duration},${log.review_state}`,
        )
        .join("\n");

      const csvString = header + rows;
      const uint8 = new TextEncoder().encode(csvString);

      const fsrsItems = convertCsvToFsrsItems(uint8, 6, timezone, (ms, tz) =>
        getTimezoneOffset(tz, ms),
      );

      parameters = await computeParameters(fsrsItems, {
        enableShortTerm: true,
        numRelearningSteps: 1,
        timeout: 500,
      });
    }

    return {
      type: "success",
      status: 200,
      data: {
        parameters,
      },
    } as ActionResult;
  },
} satisfies Actions;
