# MoodTune

MoodTune è una Single Page Application musicale sviluppata con Vue.js che permette di esplorare i brani e gli artisti più ascoltati, creare playlist personalizzate e riprodurre musica direttamente nell'app tramite YouTube.

## Funzionalità

- **Esplora** — Sfoglia i brani più ascoltati del momento tramite Last.fm, con paginazione
- **Artisti** — Visualizza gli artisti più popolari con foto e statistiche
- **Playlist** — Crea playlist manualmente cercando brani o genera una playlist automatica descrivendo il tuo mood con l'AI
- **Player** — Riproduci brani e playlist con controlli play/pausa/skip e coda di riproduzione
- **Generazione AI** — Integrazione con Google Gemini per generare playlist a partire da una descrizione testuale

## Tecnologie Utilizzate

- [Vue.js 3](https://vuejs.org/) — Framework JavaScript
- [Pinia](https://pinia.vuejs.org/) — State management
- [Vue Router](https://router.vuejs.org/) — Routing SPA
- [Last.fm API](https://www.last.fm/api) — Dati musicali (brani, artisti, ricerca)
- [YouTube Data API v3](https://developers.google.com/youtube/v3) — Riproduzione audio/video
- [Google Gemini API](https://ai.google.dev/) — Generazione playlist con AI
- [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) — Foto degli artisti