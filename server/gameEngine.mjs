import { randomUUID } from "node:crypto";
import { loadCards } from "./cardLoader.mjs";

const INITIAL_STATS = { Finanzas: 55, Perfil: 55, Salud: 55, Social: 55 };
const FAILURES = {
  Finanzas: ["Bancarrota", "El crédito y la falta de liquidez consumieron tu margen de decisión.", "Calcula el costo total antes de comprometer ingresos futuros."],
  Perfil: ["Despido por incompetencia", "Las entregas y el aprendizaje dejaron de sostener tu puesto.", "La capacitación continua es una inversión, no un lujo."],
  Salud: ["Colapso por burnout", "Tu energía no era un recurso infinito.", "El descanso es un insumo de productividad a largo plazo."],
  Social: ["Aislamiento total", "Descuidaste tu red de apoyo cuando más podía sostenerte.", "El capital social también protege tu resiliencia financiera."],
};

export class GameEngine {
  constructor() {
    this.cards = loadCards();
    this.games = new Map();
  }

  start(playerGender = "hombre") {
    const gender = playerGender === "mujer" ? "mujer" : "hombre";
    const game = {
      id: randomUUID(),
      day: 1,
      playerGender: gender,
      stats: { ...INITIAL_STATS },
      used: Object.fromEntries([1, 2, 3, 4].map((quarter) => [quarter, new Set()])),
      status: "playing",
      message: "Tu primer año comienza hoy. Mantén los cuatro pilares en equilibrio.",
      daysPassed: 0,
    };
    this.games.set(game.id, game);
    return this.payload(game, this.nextCard(game));
  }

  choose(gameId, optionId) {
    const game = this.get(gameId);
    const card = game.card;
    if (!card || game.status !== "playing") throw new Error("No hay una decisión activa para esta partida.");
    const option = card.opciones.find((item) => item.id === optionId);
    if (!option) throw new Error("La opción seleccionada no existe.");

    const effects = option.efectos ?? {};
    for (const stat of Object.keys(INITIAL_STATS)) {
      game.stats[stat] = Math.max(0, Math.min(100, game.stats[stat] + (effects[stat] ?? 0)));
    }
    game.message = option.feedback ?? option.accion ?? "Decisión registrada.";

    if (!this.checkEnd(game, effects)) {
      game.daysPassed = Math.floor(Math.random() * 3) + 1;
      game.day += game.daysPassed;
      if (game.day > 365) game.status = "won";
      else this.nextCard(game);
    }
    return this.payload(game, game.card);
  }

  nextCard(game) {
    const quarter = Math.min(4, Math.floor((game.day - 1) / 90) + 1);
    const source = this.cards[quarter];
    const intro = source.intro.filter((card) => [game.day, game.day - 1].includes(card.dia));
    let card;
    if (intro.length) {
      [card] = intro;
    } else {
      const candidates = Math.random() < 0.1 && source.unexpected.length ? source.unexpected : source.pool;
      let unused = candidates.filter((item) => !game.used[quarter].has(item.id));
      if (!unused.length) {
        game.used[quarter].clear();
        unused = candidates;
      }
      card = unused[Math.floor(Math.random() * unused.length)];
      game.used[quarter].add(card.id);
    }
    game.card = card;
    return card;
  }

  checkEnd(game, effects) {
    for (const [stat, value] of Object.entries(game.stats)) {
      if (value === 0) {
        const [title, message, lesson] = effects.game_over
          ? ["Oferta fraudulenta", "Perdiste tus ahorros en una falsa oportunidad laboral.", "Verifica las condiciones antes de entregar dinero."]
          : FAILURES[stat];
        game.status = "lost";
        game.failure = { title, message, lesson };
        return true;
      }
    }
    return false;
  }

  get(gameId) {
    const game = this.games.get(gameId);
    if (!game) throw new Error("La partida no existe o ya se reinició el servidor.");
    return game;
  }

  payload(game, card) {
    return {
      id: game.id, day: game.day, daysPassed: game.daysPassed, playerGender: game.playerGender, stats: game.stats, status: game.status,
      message: game.message, card, failure: game.failure,
    };
  }
}
