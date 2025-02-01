import { error } from "@sveltejs/kit";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";

export async function POST({ request, cookies, url }) {
  const { imageSrc } = await request.json();
  if (!imageSrc) error(400, "not found img");

  try {
    const imageBuffer = await fetch(imageSrc).then((res) => res.arrayBuffer());
    const image = sharp(imageBuffer).resize(90, 90, { fit: "inside" });
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const binaryThumbHash = rgbaToThumbHash(info.width, info.height, data);
    const base64String = btoa(
      String.fromCharCode(...new Uint8Array(binaryThumbHash))
    );
    return new Response(base64String);
  } catch (e) {
    error(404);
  }
}
