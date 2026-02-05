import type { ImageBackgroundType } from "$lib/types.js";
import { error } from "@sveltejs/kit";

// https://github.com/ORelio/Spotlight-Downloader/blob/master/SpotlightAPI.md

export async function GET({ fetch }) {
  const endpoint = "https://fd.api.iris.microsoft.com/v4/api/selection";
  const params = new URLSearchParams({
    placement: "88000820",
    bcnt: "1",
    locale: "en-US",
    country: "DE",
    fmt: "json",
  });

  try {
    const response = await fetch(`${endpoint}?${params}`);
    if (response.status !== 200) error(400, "not found");
    const data = await response.json();
    const item = JSON.parse(data.batchrsp.items[0].item).ad;

    const images: ImageBackgroundType = {
      title: item.title,
      url: item.landscapeImage.asset,
      place: item.iconHoverText,
    };

    return new Response(JSON.stringify(images));
  } catch (e) {
    error(404);
  }
}
