import type { ImageBackgroundType } from "$lib/types.js";
import { error } from "@sveltejs/kit";
import icescape from "$lib/assets/images/Icescape.jpg";

// https://github.com/ORelio/Spotlight-Downloader/blob/master/SpotlightAPI.md

const defaultImage: ImageBackgroundType = {
  title: "Stunning Icelandic region of volcanoes, beaches, and glaciers.",
  url: icescape,
  place: "Snæfellsnes peninsula, Iceland",
};

export async function GET({ fetch }) {
  const endpoint = "https://arc.msn.com/v3/Delivery/Placement";

  const params = new URLSearchParams({
    pid: "338380",
    fmt: "json",
    rafb: "0",
    ua: "WindowsShellClient",
    cdm: "1",
    disphorzres: "9999",
    dispvertres: "9999",
    lo: "80217",
    pl: "en-US",
    lc: "en-US",
    ctry: "AR",
  });

  try {
    const response = await fetch(`${endpoint}?${params}`);
    if (response.status !== 200) error(400, "not found");
    const data = await response.json();
    const item = JSON.parse(data.batchrsp.items[0].item).ad;

    const images: ImageBackgroundType = {
      title: item.hs1_title_text.tx,
      url: item.image_fullscreen_001_landscape.u,
      place: item.title_text.tx,
    };

    return new Response(JSON.stringify(images));
  } catch (e) {
    return new Response(JSON.stringify(defaultImage));
  }
}
