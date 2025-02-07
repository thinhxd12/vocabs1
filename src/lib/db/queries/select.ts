import {
  asc,
  count,
  eq,
  like,
  sql,
  isNull,
  isNotNull,
  gt,
  lt,
  desc,
} from "drizzle-orm";
import { db } from "../index";
import {
  bookmarkTable,
  diaryTable,
  memoriesTable,
  progressTable,
  scheduleTable,
  type SelectBookmark,
  type SelectMemories,
  type SelectProgress,
  type SelectSchedule,
  type SelectVocab,
  vocabTable,
  weatherTable,
} from "../schema";

export const getVocabById = async (id: SelectVocab["id"]) => {
  try {
    const result = await db
      .select()
      .from(vocabTable)
      .where(eq(vocabTable.id, id))
      .limit(1);
    if (result.length > 0) {
      return result[0];
    }
  } catch (error) {
    console.log(error);
  }
};

export const getVocabByWord = async (
  text: SelectVocab["word"]
): Promise<{ id: SelectVocab["id"]; word: SelectVocab["word"] }[]> => {
  try {
    const result = await db
      .select({ id: vocabTable.id, word: vocabTable.word })
      .from(vocabTable)
      .where(like(vocabTable.word, `${text}%`))
      .orderBy(asc(vocabTable.id))
      .limit(9);
    return result;
  } catch (error) {
    return [];
  }
};

export const getMemoriesByWord = async (text: SelectMemories["word"]) => {
  try {
    const result = await db
      .select()
      .from(memoriesTable)
      .where(like(memoriesTable.word, `${text}%`))
      .limit(1);

    if (result.length > 0) {
      return {
        status: true,
        message: `Memorized "${text}"!`,
      };
    }
    return {
      status: false,
      message: `Not found!`,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error",
    };
  }
};

export const getVocabList = async (startIndex: number) => {
  try {
    const result = await db
      .select()
      .from(vocabTable)
      .orderBy(asc(vocabTable.id))
      .offset(startIndex)
      .limit(50);
    return result;
  } catch (error) {
    return [];
  }
};

export const getWeatherList = async () => {
  try {
    const result = await db.select().from(weatherTable);
    return result;
  } catch (error) {
    return [];
  }
};

export const getSchedule = async () => {
  try {
    const result = await db
      .select()
      .from(scheduleTable)
      .orderBy(asc(scheduleTable.id));
    return result;
  } catch (error) {
    return [];
  }
};

export const getScheduleByDate = async (dateSearch: string) => {
  try {
    const result = await db
      .select()
      .from(scheduleTable)
      .orderBy(asc(scheduleTable.id))
      .where(eq(scheduleTable.date, new Date(dateSearch)));
    return result;
  } catch (error) {
    return [];
  }
};

export const getScheduleByProgress = async () => {
  try {
    const result = await db
      .select()
      .from(scheduleTable)
      .orderBy(asc(scheduleTable.id))
      .where(isNull(scheduleTable.date))
      .limit(2);
    return result;
  } catch (error) {
    return [];
  }
};

export const getAllScheduleHaveDate = async () => {
  try {
    const result = await db
      .select()
      .from(scheduleTable)
      .orderBy(asc(scheduleTable.id))
      .where(isNotNull(scheduleTable.date));
    return result as SelectSchedule[];
  } catch (error) {
    return [];
  }
};

export const getAllProgress = async () => {
  try {
    const result = await db
      .select()
      .from(progressTable)
      .orderBy(asc(progressTable.id));
    return result;
  } catch (error) {
    return [];
  }
};

export const getLastPartProgress = async () => {
  try {
    const lengthVocabTable = await db
      .select({ count: count() })
      .from(progressTable);
    const startOfIndex = Math.floor(lengthVocabTable[0].count / 5 - 3);

    const result = await db
      .select()
      .from(progressTable)
      .orderBy(asc(progressTable.id))
      .offset(startOfIndex * 5);
    return result;
  } catch (error) {
    return [];
  }
};

export const getDiary = async () => {
  try {
    const result = await db
      .select()
      .from(diaryTable)
      .orderBy(asc(diaryTable.id));
    return result;
  } catch (error) {
    return [];
  }
};

export const getBookmarkById = async (id: SelectBookmark["id"]) => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .where(eq(bookmarkTable.id, id))
      .limit(1);
  } catch (error) {
    console.log(error);
  }
};

export const getBookmarkBySelected = async () => {
  try {
    const result = await db
      .select()
      .from(bookmarkTable)
      .where(eq(bookmarkTable.selected, true))
      .limit(1);

    return result[0] as SelectBookmark;
  } catch (error) {
    console.log(error);
  }
};

export const getNextBookmark = async (id: SelectBookmark["id"]) => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .where(gt(bookmarkTable.id, id))
      .orderBy(asc(bookmarkTable.id))
      .limit(1);
  } catch (error) {
    console.log(error);
  }
};

export const getPreviousBookmark = async (id: SelectBookmark["id"]) => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .where(lt(bookmarkTable.id, id))
      .orderBy(desc(bookmarkTable.id))
      .limit(1);
  } catch (error) {
    console.log(error);
  }
};

export const getRandomBookmark = async () => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .orderBy(sql`random()`)
      .limit(1);
  } catch (error) {
    console.log(error);
  }
};

export const findTextBookmark = async (text: string) => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .where(
        sql`to_tsvector('english', ${bookmarkTable.content}) @@ websearch_to_tsquery('english', ${text})`
      );
  } catch (error) {
    console.log(error);
  }
};

export const getTotalMemories = async () => {
  try {
    const length = await db.select({ count: count() }).from(memoriesTable);
    return length[0].count;
  } catch (error) {
    return 0;
  }
};

export const getTotalProgress = async () => {
  try {
    const length = await db.select({ count: count() }).from(progressTable);
    return length[0].count;
  } catch (error) {
    return 0;
  }
};

export const getTotalProgressByIndex = async (index: number) => {
  try {
    const result = await db
      .select()
      .from(progressTable)
      .orderBy(asc(progressTable.id))
      .offset(index * 5)
      .limit(5);
    return result as SelectProgress[];
  } catch (error) {
    return [];
  }
};

export const getLastProgress = async () => {
  try {
    const lastProgress = await db
      .select()
      .from(progressTable)
      .orderBy(desc(progressTable.id))
      .limit(1);
    return lastProgress[0] as SelectProgress;
  } catch (error) {
    console.log(error);
  }
};
