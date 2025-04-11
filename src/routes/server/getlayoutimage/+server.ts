export async function GET({ fetch }) {
  const endpoint = "https://fd.api.iris.microsoft.com/v4/api/selection";
  const params = new URLSearchParams({
    placement: "88000820",
    bcnt: "1",
    locale: "en-DE",
    country: "DE",
    fmt: "json",
  });

  try {
    const response = await fetch(`${endpoint}?${params}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch images");

    const data = await response.json();
    const item = JSON.parse(data.batchrsp.items[0].item).ad;
    const images = {
      title: item.title,
      description: item.description,
      landscapeImageUrl: item.landscapeImage.asset,
      portraitImageUrl: item.portraitImage.asset,
      copyright: item.copyright,
      ctaText: item.ctaText,
      ctaUri: item.ctaUri,
    };

    return new Response(JSON.stringify(images));
  } catch (error) {
    console.error("Error fetching Spotlight images:", error);
    return new Response(JSON.stringify([]));
  }
}
