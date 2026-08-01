import { useEffect, useRef, useState } from "react";

const TRACKS = ["/Musica/oficina-01.mp3", "/Musica/oficina-02.mp3", "/Musica/oficina-03.mp3"];
const VOLUME = 0.14;

export default function BackgroundMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState(() => Math.floor(Math.random() * TRACKS.length));
  const [muted, setMuted] = useState(false);

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
      <button
        className="music-toggle"
        type="button"
        aria-pressed={muted}
        onClick={() => setMuted((current) => !current)}
      >
        {muted ? "♫ Activar música" : "♪ Silenciar música"}
      </button>
    </>
  );
}
