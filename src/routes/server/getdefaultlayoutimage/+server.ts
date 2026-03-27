import type { ImageBackgroundType } from "$lib/types.js";
import icescape from "$lib/assets/images/Icescape.jpg";

const defaultImage: ImageBackgroundType = {
  title: "Stunning Icelandic region of volcanoes, beaches, and glaciers.",
  url: icescape,
  place: "Snæfellsnes peninsula, Iceland",
};

export async function GET() {
  return new Response(JSON.stringify(defaultImage));
}
