import type { LoginImageType } from "$lib/types";
import { error } from "@sveltejs/kit";

export async function GET({ fetch }) {
  try {
    const url =
      "https://fd.api.iris.microsoft.com/v4/api/selection?&placement=88000820&bcnt=1&country=US&locale=en-US&fmt=json";
    const response = await fetch(url);
    const data = await response.json();
    const obj = data["batchrsp"]["items"][0]["item"];
    const result = JSON.parse(obj)["ad"];
    const urlP = result.portraitImage.asset;
    const hs1 = result.iconHoverText.split("\r\n©");

    const img = {
      title: result.title,
      hs1_title: hs1[0],
      hs2_title: result.description,
      image_L: result.landscapeImage.asset,
      image_P: urlP,
      hash: "",
    } as LoginImageType;
    return new Response(JSON.stringify(img));
  } catch (e) {
    error(404);
  }
}
