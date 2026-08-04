import { getRandomTip } from "../../server/tipsLoader.mjs";

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ detail: "Método no permitido." });
  }
  try {
    return response.status(200).json(getRandomTip());
  } catch (error) {
    return response.status(500).json({ detail: error.message });
  }
}
