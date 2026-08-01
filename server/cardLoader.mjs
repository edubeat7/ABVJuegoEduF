import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());

function readJson(name) {
  return JSON.parse(readFileSync(join(root, name), "utf8"));
}

function flatten(cards) {
  return cards.flatMap((item) =>
    item.pool_aleatorio_cartas ? flatten(item.pool_aleatorio_cartas) : [item],
  );
}

function prepare(card, quarter, unexpected = false) {
  return {
    ...card,
    id: `q${quarter}-${card.dia ?? card.carta ?? card.id ?? crypto.randomUUID()}`,
    trimestre: quarter,
    inesperado: unexpected || /inesperado|imprevisto/i.test(card.tipo ?? ""),
    personaje: card.personaje ?? "Oficina 360",
    tipo: card.tipo ?? (unexpected ? "Evento inesperado" : "Decisión"),
    ...(unexpected ? { titulo: card.titulo ?? "Evento inesperado" } : {}),
  };
}

export function loadCards() {
  const quarters = {};
  for (let quarter = 1; quarter <= 4; quarter += 1) {
    const data = readJson(`PreguntasQ${quarter}.json`);
    const intro = data.cartas_iniciales ?? data.bloque_introductorio ?? [];
    const pool = data.pool_aleatorio_cartas ?? data.pool_aleatorio_modular ?? [];
    quarters[quarter] = {
      intro: intro.map((card) => prepare(card, quarter)),
      pool: flatten(pool).map((card) => prepare(card, quarter)),
      unexpected: [],
    };
  }

  const extras = readJson("PreguntasExtra.json").bloques_inesperados ?? {};
  for (let quarter = 1; quarter <= 4; quarter += 1) {
    quarters[quarter].unexpected = (extras[`trimestre_${quarter}`] ?? [])
      .map((card) => prepare(card, quarter, true));
  }
  return quarters;
}
