import { error } from "@sveltejs/kit";
import { load } from "cheerio";
import type {
  DBInsert,
  VocabDefinitionsType,
  VocabExampleType,
  VocabMeaningType,
} from "$lib/types";
import { v7 as uuidv7 } from "uuid";

async function fetchGetText(url: string) {
  try {
    let response = await fetch(url, {
      headers: {
        "cache-control": "no-cache",
      },
    });
    let text = await response.text();
    return text;
  } catch (error) {
    return "";
  }
}

async function getOedSoundURL(text: string) {
  const oedUrl = `https://www.oed.com/search/dictionary/?scope=Entries&q=${text}&tl=true`;
  const data = await fetchGetText(oedUrl);
  const docOed = load(data);
  const urlParam = docOed(".viewEntry").attr("href");
  if (urlParam) {
    const newUrl = "https://www.oed.com" + urlParam;
    const link = newUrl.replace(/\?.+/g, "?tab=factsheet&tl=true#39853451");
    const nextPageHtml = await fetchGetText(link);
    const nextPageDoc = load(nextPageHtml);
    const sound = nextPageDoc(".regional-pronunciation")
      .last()
      .find(".pronunciation-play-button")
      .attr("data-src-mp3");
    return sound;
  }
}

async function getLearnersMp3(text: string) {
  const searchUrl = `https://www.oxfordlearnersdictionaries.com/definition/english/${text}?q=${text}`;
  const data = await fetchGetText(searchUrl);
  const doc = load(data);
  const sound = doc(".audio_play_button.pron-us.icon-audio").attr(
    "data-src-mp3",
  );
  if (sound) return sound;
  return "";
}

export async function GET({ url }) {
  const text = url.searchParams.get("word");
  if (!text) error(404);
  const urlWebter = `https://www.merriam-webster.com/dictionary/${text}`;

  const result: DBInsert["vocab_table"] = {
    id: uuidv7(),
    word: "",
    audio: "",
    phonetics: "",
    meanings: [],
  };

  try {
    const data = await Promise.all([
      fetchGetText(urlWebter),
      getLearnersMp3(text),
    ]);
    const $ = load(data[0]);
    result.word = $("h1.hword").text();
    result.audio = data[1] || "";
    result.phonetics = $(".prons-entries-list-inline a").first().text().trim();

    //Definitions
    $('div[id^="dictionary-entry-"]').each((index, element) => {
      let meaning: VocabMeaningType = {
        partOfSpeech: "",
        definitions: [],
        synonyms: [],
        translation: [],
      };
      const partOfSpeech = $(element)
        .find(".parts-of-speech a")
        .first()
        .text()
        .split(" ")[0];

      meaning.partOfSpeech = partOfSpeech;
      meaning.definitions = [];
      meaning.synonyms = [];
      meaning.translation = [];

      let dummyDefinition: VocabDefinitionsType = {
        definition: [],
        example: {
          author: "",
          sentence: "",
          title: "",
          year: "",
        },
        hash: "",
        image: "",
      };

      let definitionItems = $(element).find(".vg-sseq-entry-item").first();
      definitionItems.each((index, element) => {
        $(element)
          .find(".sb-entry")
          .each((ind, item) => {
            $(item)
              .find(".sense")
              .each((m, n) => {
                let letter = $(n).find(".letter").text().trim();
                let num = $(n).find(".sub-num").text().trim();
                let sense = $(n)
                  .find(".dtText")
                  .text()
                  .trim()
                  .replace(/[\n\r]+|\s{2,}/g, " ");
                dummyDefinition.definition.push({ letter, num, sense });
              });
          });
        meaning.definitions.push(dummyDefinition);
      });
      result.meanings.push(meaning);
    });

    result.meanings = result.meanings.reduce((acc: any, d: any) => {
      const found = acc.find((a: any) => a.partOfSpeech === d.partOfSpeech);
      if (!found) {
        acc.push(d);
      } else {
        found.definitions.push(d.definitions[0]);
      }
      return acc;
    }, []);

    //Synonym
    let synonymArray: { type: string; content: string[] }[] = [];
    const synonymTitle = $("#synonyms").find(".function-label");
    if (!synonymTitle.text()) {
      let type = result.meanings[0].partOfSpeech;
      let content: any = [];
      $("#synonyms")
        .find("li")
        .slice(0, 12)
        .each((ind, item) => {
          content.push(
            $(item)
              .text()
              .replace(/[\n\r]+|\s{2,}/g, ""),
          );
        });
      synonymArray.push({ type, content });
    } else {
      synonymTitle.each((index, element) => {
        let type = $(element).text().toLowerCase().trim().split(" ")[0];
        let content: any = [];
        $(element)
          .next()
          .find("li")
          .slice(0, 12)
          .each((ind, item) => {
            content.push(
              $(item)
                .text()
                .replace(/[\n\r]+|\s{2,}/g, ""),
            );
          });
        synonymArray.push({ type, content });
      });
    }

    //Example
    let exampleArray: {
      type: string;
      content: VocabExampleType;
    }[] = [];
    const exampleTitle = $(".on-web").find(".function-label-header");
    if (!exampleTitle.text()) {
      let type = result.meanings[0].partOfSpeech;
      let sentence =
        $(".on-web").find(".t").first().html()?.replace(" </em>", "</em> ") ||
        "";
      let cred = $(".on-web")
        .find(".auth")
        .first()
        .text()
        .trim()
        .replace("—", "")
        .split(", ");
      let author = cred[cred.length - 3] ? cred[cred.length - 3] : "";
      let title = cred[cred.length - 2] ? cred[cred.length - 2] : "";
      let year = cred[cred.length - 1] ? cred[cred.length - 1] : "";
      let content = { sentence, author, title, year };
      exampleArray.push({ type, content });
    } else {
      exampleTitle.each((index, element) => {
        let type = $(element).text().toLowerCase().trim().split(" ")[0];
        let sentence =
          $(element).next().find(".t").html()?.replace(" </em>", "</em> ") ||
          "";
        let cred = $(element)
          .next()
          .find(".auth")
          .text()
          .trim()
          .replace("—", "")
          .split(", ");
        let author = cred[cred.length - 3] ? cred[cred.length - 3] : "";
        let title = cred[cred.length - 2] ? cred[cred.length - 2] : "";
        let year = cred[cred.length - 1] ? cred[cred.length - 1] : "";
        let content = { sentence, author, title, year };
        exampleArray.push({ type, content });
      });
    }

    result.meanings = result.meanings.map((item) => {
      return {
        ...item,
        synonyms:
          synonymArray.find((el) => el.type === item.partOfSpeech)?.content ||
          [],
        definitions: item.definitions.map((el, ind) => {
          if (ind === 0) {
            el.example =
              exampleArray.find((el) => el.type === item.partOfSpeech)
                ?.content || el.example;
          }
          return { ...el };
        }),
      };
    });

    return new Response(JSON.stringify(result));
  } catch (error) {
    console.error(error);
  }
}
