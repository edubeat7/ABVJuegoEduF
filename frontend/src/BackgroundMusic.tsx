import { useEffect, useRef, useState } from "react";

const TRACKS = ["/Musica/oficina-01.mp3", "/Musica/oficina-02.mp3", "/Musica/oficina-03.mp3"];
const VOLUME = 0.14;

type BackgroundMusicProps = { onRestart: () => void; onShowTip: () => void };

export default function BackgroundMusic({ onRestart, onShowTip }: BackgroundMusicProps) {
  const audio = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState(() => Math.floor(Math.random() * TRACKS.length));
  const [muted, setMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    player.volume = VOLUME;
    player.muted = muted;
    if (muted) return;
    void player.play().catch(() => {
      // El navegador puede requerir otra interacción antes de reproducir audio.
    });
  }, [track, muted]);

  return (
    <>
      <audio
        ref={audio}
        src={TRACKS[track]}
        preload="auto"
        onEnded={() => setTrack((current) => (current + 1) % TRACKS.length)}
      />
      <div className="game-options">
        <button className="options-toggle" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
          ⚙ Opciones
        </button>
        {menuOpen && <div className="options-menu">
          <button type="button" aria-pressed={muted} onClick={() => setMuted((current) => !current)}>
            {muted ? "♫ Activar música" : "♪ Silenciar música"}
          </button>
          <button type="button" onClick={() => { setMenuOpen(false); onShowTip(); }}>
            💡 Consejos
          </button>
          <button className="restart-button" type="button" onClick={onRestart}>↻ Reiniciar partida</button>
        </div>}
      </div>
    </>
  );
}
