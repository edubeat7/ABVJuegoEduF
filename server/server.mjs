import express from "express";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { GameEngine } from "./gameEngine.mjs";
import { getRandomTip } from "./tipsLoader.mjs";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const dist = join(root, "frontend", "dist");
const app = express();
const engine = new GameEngine();
const port = Number(process.env.PORT ?? 8000);

app.use(express.json());
app.use((_, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/health", (_, response) => response.json({ status: "ok" }));
app.get("/tips/random", (_, response) => {
  try {
    response.json(getRandomTip());
  } catch (error) {
    response.status(500).json({ detail: error.message });
  }
});
app.post("/game/start", (request, response) => response.json(engine.start(request.body?.gender)));
app.post("/game/:gameId/choose", (request, response) => {
  try {
    if (request.params.gameId !== request.body?.game?.id) throw new Error("La partida recibida no coincide con la ruta.");
    response.json(engine.choose(request.body.game, request.body.option_id));
  } catch (error) {
    response.status(400).json({ detail: error.message });
  }
});

if (existsSync(dist)) app.use(express.static(dist));

app.listen(port, "127.0.0.1", () => {
  console.log(`Oficina 360 disponible en http://127.0.0.1:${port}`);
});
