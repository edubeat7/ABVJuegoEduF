import { useState } from "react";
import BackgroundMusic from "./BackgroundMusic";

const API = "";
type Gender = "hombre" | "mujer";
type Effects = Record<string, number | boolean>;
type Option = { id: string; accion: string; efectos: Effects };
type Card = { personaje: string; texto: string; tipo: string; inesperado: boolean; opciones: Option[] };
type Game = {
  id: string; day: number; daysPassed: number; playerGender: Gender; stats: Record<string, number>; status: "playing" | "lost" | "won";
  message: string; card?: Card; failure?: { title: string; message: string; lesson: string };
};
const PILLARS = [
  ["Salud", "♥", "Salud y bienestar"], ["Perfil", "◆", "Perfil profesional"],
  ["Social", "●", "Red social"], ["Finanzas", "$", "Presupuesto"],
] as const;
const PLAYER_IMAGE: Record<Gender, string> = { hombre: "/YoHombreOamigo.png", mujer: "/YoMujerOamigo.png" };

function characterImage(personaje: string, gender: Gender) {
  const name = personaje.toLowerCase();
  if (/amig[oa]|pareja/.test(name)) return PLAYER_IMAGE[gender === "hombre" ? "mujer" : "hombre"];
  if (/recursos|rr\.?\s*hh|directora/.test(name)) return "/RecursosH.png";
  if (/jefe|gerente/.test(name)) return "/Jefe.png";
  if (/banco|banquer|contabilidad|inversi/.test(name)) return "/Banquero.png";
  if (/familia|propietario|madre|padre/.test(name)) return "/Familia.png";
  if (/colega|compañer/.test(name)) return "/Colega1.png";
  if (/agente|reclutador|cazatalento/.test(name)) return "/AgenteM.png";
  return PLAYER_IMAGE[gender];
}

export default function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);

  const start = async (gender: Gender) => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API}/game/start`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender }),
      });
      if (!response.ok) throw new Error("No se pudo iniciar el motor del juego.");
      setGame(await response.json());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Error de conexión.");
    } finally { setLoading(false); }
  };

  const choose = async (option: Option) => {
    if (!game || game.status !== "playing") return;
    setLoading(true); setDragX(0);
    try {
      const response = await fetch(`${API}/game/${game.id}/choose`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_id: option.id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "No se pudo registrar la decisión.");
      setGame(body);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Error de conexión."); }
    finally { setLoading(false); }
  };

  const onPointerUp = () => {
    if (game?.card?.opciones.length === 2 && Math.abs(dragX) > 100) {
      void choose(game.card.opciones[dragX < 0 ? 0 : 1]);
    }
    setStartX(null); setDragX(0);
  };

  if (!game) return (
    <main className="identity-screen">
      <div className="identity-card">
        <div className="brand">OFICINA <strong>360</strong></div>
        <span className="identity-icon">▣</span>
        <h1>Antes de firmar</h1>
        <p>¿Con qué identidad vivirás este primer año profesional?</p>
        <div className="identity-options">
          <button disabled={loading} onClick={() => void start("mujer")}><img src={PLAYER_IMAGE.mujer} alt="" /><b>Soy mujer</b><small>Tu amigo será hombre</small></button>
          <button disabled={loading} onClick={() => void start("hombre")}><img src={PLAYER_IMAGE.hombre} alt="" /><b>Soy hombre</b><small>Tu amiga será mujer</small></button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    </main>
  );

  if (game.status !== "playing") return (
    <main className={`ending ${game.status}`}>
      <div className="brand">OFICINA <strong>360</strong></div>
      <div className="ending-card">
        <span className="ending-icon">{game.status === "won" ? "★" : "!"}</span>
        <h1>{game.status === "won" ? "Ascenso aprobado" : game.failure?.title}</h1>
        <p>{game.status === "won" ? "Completaste los 365 días sin perder el equilibrio. La junta te asciende a Gerente de Departamento." : game.failure?.message}</p>
        {game.status === "lost" && <aside><b>Lección para tu yo Humano</b><br />{game.failure?.lesson}</aside>}
        <button onClick={() => setGame(null)}>Comenzar un nuevo año</button>
      </div>
    </main>
  );

  const card = game.card!;
  return (
    <main className="game-shell">
      <header>
        <div className="brand">OFICINA <strong>360</strong></div>
        <div className="day">DÍA <b>{game.day}</b><span> / 365{game.daysPassed > 0 ? ` · +${game.daysPassed} días` : ""}</span></div>
        <BackgroundMusic />
      </header>
      <section className="stats" aria-label="Indicadores vitales">
        {PILLARS.map(([key, icon, label]) => <div className="stat" key={key}>
          <div className="stat-label"><span>{icon}</span>{label}</div>
          <div className="bar"><i style={{ width: `${game.stats[key]}%` }} /></div>
          <b>{game.stats[key]}%</b>
        </div>)}
      </section>
      <p className="feedback">{game.message}</p>
      <section className="scene">
        {card.opciones.length === 2 && <div className="swipe-hints"><span>← {card.opciones[0].accion}</span><span>{card.opciones[1].accion} →</span></div>}
        <article
          className={`decision-card ${card.inesperado ? "unexpected" : ""}`}
          style={{ transform: `translateX(${dragX}px) rotate(${dragX / 24}deg)` }}
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setStartX(event.clientX); }}
          onPointerMove={(event) => startX !== null && setDragX(event.clientX - startX)}
          onPointerUp={onPointerUp}
        >
          {card.inesperado && <div className="alert">⚡ EVENTO INESPERADO</div>}
          <img className="character-portrait" src={characterImage(card.personaje, game.playerGender)} alt={card.personaje} />
          <div className="card-copy"><small>{card.tipo}</small><h2>{card.personaje}</h2><p>{card.texto}</p></div>
        </article>
      </section>
      <section className={`choices ${card.opciones.length > 2 ? "multiple" : ""}`}>
        {card.opciones.map((option, index) => <button key={option.id} disabled={loading} onClick={() => void choose(option)}>
          <span>{card.opciones.length === 2 ? (index === 0 ? "←" : "→") : option.id}</span>
          <em>{option.accion}</em>
        </button>)}
      </section>
      {error && <p className="error">{error}</p>}
    </main>
  );
}
