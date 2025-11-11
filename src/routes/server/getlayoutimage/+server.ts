import type { BackgroundImageType } from "$lib/types.js";

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
    const data = await response.json();
    const item = JSON.parse(data.batchrsp.items[0].item).ad;

    const images: BackgroundImageType = {
      title: item.title,
      url: item.landscapeImage.asset,
      place: item.iconHoverText,
    };

    return new Response(JSON.stringify(images));
  } catch (error) {
    console.error("Error fetching Spotlight images:", error);
    return new Response(JSON.stringify([]));
  }
}
