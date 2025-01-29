import { db } from "$lib/db";
import { deleteVocabById } from "$lib/db/queries/delete.js";
import { insertMemories } from "$lib/db/queries/insert";
import { vocabTable } from "$lib/db/schema";
import { error, json } from "@sveltejs/kit";
import { count, asc, eq, desc, DrizzleError } from "drizzle-orm";

export async function GET({ url }) {
  const id = url.searchParams.get("id");
  const word = url.searchParams.get("word");
  if (!id) throw error(400, "id not found");
  if (!word) throw error(400, "word not found");
  await insertMemories({ word: word });
  await deleteVocabById(id);

  const lengthVocabTable = await db.select({ count: count() }).from(vocabTable);
  if (lengthVocabTable[0].count % 200 === 0)
    return json({ id }, { status: 201 });
  const endOfIndex = Math.floor(lengthVocabTable[0].count / 200) * 200;

  const rangeResults = db
    .select()
    .from(vocabTable)
    .orderBy(asc(vocabTable.id))
    .offset(endOfIndex)
    .as("rangeResults");

  const smallestRow = await db
    .select()
    .from(vocabTable)
    .leftJoin(rangeResults, eq(vocabTable.id, rangeResults.id))
    .orderBy(asc(rangeResults.number))
    .limit(1);

  await db
    .update(vocabTable)
    .set({
      id: id,
    })
    .where(eq(vocabTable.id, smallestRow[0].rangeResults!.id));
  return json({ word }, { status: 201 });
}
