import { GameEngine } from "../../server/gameEngine.mjs";

const engine = new GameEngine();

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ detail: "Método no permitido." });
  }
  return response.status(200).json(engine.start(request.body?.gender));
}
