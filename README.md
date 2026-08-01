# Oficina 360

Juego narrativo de decisiones financieras estilo *swipe-card*. Sobrevive 365 días equilibrando Salud, Perfil profesional, Red social y Finanzas.

## Ejecutar

Todo el proyecto usa Node.js. Instala las dependencias y construye la interfaz una vez:

```powershell
npm install
npm run install:frontend
npm run build
```

Inicia el juego:

```powershell
npm start
```

Abre `http://127.0.0.1:8000`.

Para editar la interfaz con recarga automática:

```powershell
npm run dev
```

Mantén `npm start` abierto para que el motor de juego esté disponible.

## Contenido

- `server/`: API Express y motor de 365 turnos.
- `frontend/`: interfaz React con botones y gestos de deslizamiento.
- `PreguntasQ1.json` a `PreguntasQ4.json`: decisiones por trimestre.
- `PreguntasExtra.json`: eventos inesperados, usados en aproximadamente el 10% de los turnos.

El cargador Node acepta la estructura actual de los JSON, incluido el pool anidado de Q1, sin modificar las cartas originales.
