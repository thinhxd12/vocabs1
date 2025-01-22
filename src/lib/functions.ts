import type { LoginImageType } from "../types";

export const getSpotlightImage_v4 = async (fetch: any, setHeaders: any) => {
  const url =
    "https://fd.api.iris.microsoft.com/v4/api/selection?&placement=88000820&bcnt=1&country=DK&locale=en-US&fmt=json";
  const response = await fetch(url);
  setHeaders({
    "cache-control": "no-cache",
  });
  const data = await response.json();
  const obj = data["batchrsp"]["items"][0]["item"];
  const result = JSON.parse(obj)["ad"];
  const urlP = result.portraitImage.asset;
  // const thumbhash = await createThumbhash(urlP);
  const hs1 = result.iconHoverText.split("\r\n©");

  return {
    title: result.title,
    hs1_title: hs1[0],
    hs2_title: result.description,
    image_L: result.landscapeImage.asset,
    image_P: urlP,
    //   hash: thumbhash,
    hash: "",
  } as LoginImageType;
};
