<template>
  <div class="artisti">
    <h1 class="titolo-pagina">Artisti</h1>

    <div class="lista">
      <div class="riga" v-for="artista in artisti" :key="artista.mbid" @click="apriModale(artista)">
        <div class="riga-info">
          <p class="nome">{{ artista.name }}</p>
          <p class="ascoltatori">{{ Number(artista.listeners).toLocaleString() }} ascoltatori</p>
        </div>
        <span class="freccia">→</span>
      </div>
    </div>

    <div class="paginazione">
      <button class="btn-pagina" @click="paginaPrecedente" :disabled="paginaCorrente === 1">← Precedente</button>
      <span class="num-pagina">{{ paginaCorrente }}</span>
      <button class="btn-pagina" @click="paginaSuccessiva">Successiva →</button>
    </div>

    <div class="modale-overlay" v-if="artistaSelezionato" @click.self="chiudiModale">
      <div class="modale">
        <button class="btn-chiudi" @click="chiudiModale">✕</button>
        <div class="modale-contenuto">
          <div class="modale-foto">
            <img v-if="fotoArtista" :src="fotoArtista" :alt="artistaSelezionato.name" />
            <div v-else-if="caricandoFoto" class="foto-placeholder">...</div>
            <div v-else class="foto-placeholder">♪</div>
          </div>
          <div class="modale-info">
            <h2>{{ artistaSelezionato.name }}</h2>
            <p class="stat">{{ Number(artistaSelezionato.listeners).toLocaleString() }} ascoltatori</p>
            <p class="stat">{{ Number(artistaSelezionato.playcount).toLocaleString() }} riproduzioni</p>
            <a :href="artistaSelezionato.url" target="_blank" class="btn-lastfm">Apri su Last.fm →</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getTopArtisti } from "../api/lastfm"

export default {
  data() {
    return {
      artisti: [],
      paginaCorrente: 1,
      artistaSelezionato: null,
      fotoArtista: null,
      caricandoFoto: false
    }
  },

  async mounted() {
    this.caricaArtisti()
  },

  methods: {
    async caricaArtisti() {
      const dati = await getTopArtisti(this.paginaCorrente)
      this.artisti = dati.artists.artist
    },
    paginaPrecedente() {
      this.paginaCorrente--
      this.caricaArtisti()
    },
    paginaSuccessiva() {
      this.paginaCorrente++
      this.caricaArtisti()
    },
    async apriModale(artista) {
      this.artistaSelezionato = artista
      this.fotoArtista = null
      this.caricandoFoto = true
      try {
        const risposta = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artista.name)}`)
        const dati = await risposta.json()
        this.fotoArtista = dati.thumbnail?.source || null
      } catch {
        this.fotoArtista = null
      }
      this.caricandoFoto = false
    },
    chiudiModale() {
      this.artistaSelezionato = null
      this.fotoArtista = null
    }
  }
}
</script>

<style scoped>
.titolo-pagina {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 32px;
}

.riga {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  animation: fadeUp 0.3s ease both;
}

.riga:hover {
  border-color: var(--accent);
  transform: translateX(4px);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.nome {
  font-weight: 600;
  font-size: 0.92rem;
  margin-bottom: 3px;
}

.ascoltatori {
  font-size: 0.74rem;
  color: var(--accent2);
  font-weight: 500;
}

.freccia {
  color: var(--text-muted);
  font-size: 1rem;
  transition: transform 0.2s;
}

.riga:hover .freccia {
  transform: translateX(4px);
  color: var(--accent);
}

.paginazione {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.btn-pagina {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-pagina:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-pagina:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.num-pagina {
  font-size: 0.88rem;
  color: var(--text-muted);
  min-width: 20px;
  text-align: center;
}

.modale-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(6px);
}

.modale {
  background: var(--surface);
  border-radius: var(--radius);
  width: 100%;
  max-width: 680px;
  padding: 28px;
  position: relative;
  border: 1px solid var(--border);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-chiudi {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-chiudi:hover { color: var(--text); }

.modale-contenuto {
  display: flex;
  gap: 28px;
  align-items: center;
}

.modale-foto {
  width: 180px;
  min-width: 180px;
  height: 180px;
  border-radius: var(--radius);
  overflow: hidden;
}

.modale-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.foto-placeholder {
  width: 100%;
  height: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--text-muted);
}

.modale-info h2 {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
}

.stat {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.btn-lastfm {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 20px;
  background: var(--accent);
  color: white;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  transition: opacity 0.2s;
}

.btn-lastfm:hover { opacity: 0.85; }
</style>