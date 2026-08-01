import { GameEngine } from "../../../server/gameEngine.mjs";

const engine = new GameEngine();

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ detail: "Método no permitido." });
  }
  try {
    const gameId = request.query?.gameId;
    if (gameId && gameId !== request.body?.game?.id) {
      throw new Error("La partida recibida no coincide con la ruta.");
    }
    return response.status(200).json(engine.choose(request.body?.game, request.body?.option_id));
  } catch (error) {
    return response.status(400).json({ detail: error.message });
  }
}
