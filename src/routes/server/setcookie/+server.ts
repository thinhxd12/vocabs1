import { json } from "@sveltejs/kit";

export async function POST({ request, cookies }) {
  cookies.set("logged_in", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
  });

  return json({ message: "Cookie set" });
}
