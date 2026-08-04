import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());

export function getRandomTip() {
  const { consejos } = JSON.parse(readFileSync(join(root, "Consejos.json"), "utf8"));
  if (!Array.isArray(consejos) || consejos.length === 0) {
    throw new Error("No hay consejos disponibles.");
  }
  return consejos[Math.floor(Math.random() * consejos.length)];
}
