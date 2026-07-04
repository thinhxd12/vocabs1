import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { GoogleGenAI } from "@google/genai";
import { SECRET_GEMINI_API_KEY } from "$env/static/private";

const ai = new GoogleGenAI({ apiKey: SECRET_GEMINI_API_KEY });

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      throw error(400, "Prompt is required");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return json({ text: response.text });
  } catch (err) {
    console.error("GenAI Error:", err);
    throw error(500, "Failed to generate content");
  }
};
