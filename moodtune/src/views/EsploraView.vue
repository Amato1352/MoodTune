<template>
  <div class="esplora">
    <h1 class="titolo-pagina">Esplora</h1>

    <div class="barra-ricerca">
      <input
        class="input-ricerca"
        v-model="query"
        placeholder="Cerca un brano..."
        @input="cercaBraniEsplora"
      />
      <button v-if="query" class="btn-clear" @click="svuotaRicerca">✕</button>
    </div>

    <div class="lista">
      <div v-if="erroreLastFm" class="errore-ultimo">
        {{ erroreLastFm }}
      </div>
      <div class="riga"
        v-for="brano in risultatiRicerca.length ? risultatiRicerca : brani"
        :key="brano.mbid || brano.url"
        @click="apriModale(brano)">
        <div class="riga-info">
          <p class="nome">{{ brano.name }}</p>
          <p class="artista">{{ brano.artist?.name || brano.artist }}</p>
        </div>
        <div class="riga-destra">
          <p class="ascoltatori">{{ Number(brano.listeners).toLocaleString() }} ascolti</p>
          <span class="freccia">→</span>
        </div>
      </div>
    </div>

    <div class="paginazione" v-if="!query">
      <button class="btn-pagina" @click="paginaPrecedente" :disabled="paginaCorrente === 1">← Precedente</button>
      <span class="num-pagina">{{ paginaCorrente }}</span>
      <button class="btn-pagina" @click="paginaSuccessiva">Successiva →</button>
    </div>

    <div class="modale-overlay" v-if="branoSelezionato" @click.self="chiudiModale">
      <div class="modale">
        <button class="btn-chiudi" @click="chiudiModale">✕</button>
        <div class="modale-contenuto">
          <div class="modale-foto">
            <img v-if="fotoArtista" :src="fotoArtista" :alt="branoSelezionato.artist?.name || branoSelezionato.artist" />
            <div v-else-if="caricandoFoto" class="foto-placeholder">...</div>
            <div v-else class="foto-placeholder">♪</div>
          </div>
          <div class="modale-info">
            <h2>{{ branoSelezionato.name }}</h2>
            <p class="artista-modale">{{ branoSelezionato.artist?.name || branoSelezionato.artist }}</p>
            <p class="stat">{{ Number(branoSelezionato.listeners).toLocaleString() }} ascoltatori</p>
            <p class="stat">{{ Number(branoSelezionato.playcount).toLocaleString() }} riproduzioni</p>
            <button class="btn-coda" @click="aggiungiACoda">Aggiungi alla coda</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usePlayerStore } from "../magazzino/player"
import { getTopBrani, cercaBrani } from '../api/lastfm'

export default {
  setup() {
    const playerStore = usePlayerStore()
    return { playerStore }
  },

  data() {
    return {
      brani: [],
      paginaCorrente: 1,
      branoSelezionato: null,
      fotoArtista: null,
      caricandoFoto: false,
      query: '',
      risultatiRicerca: [],
      erroreLastFm: null
    }
  },

  async mounted() {
    this.caricaBrani()
  },

  methods: {
    async caricaBrani() {
      try {
        const dati = await getTopBrani(this.paginaCorrente)
        this.brani = dati.tracks?.track || []
        this.erroreLastFm = null
      } catch (error) {
        console.error('Errore caricamento brani:', error)
        this.brani = []
        this.erroreLastFm = 'Impossibile caricare i brani. Controlla la connessione o riprova più tardi.'
      }
    },
    paginaPrecedente() {
      this.paginaCorrente--
      this.caricaBrani()
    },
    paginaSuccessiva() {
      this.paginaCorrente++
      this.caricaBrani()
    },
    async apriModale(brano) {
      this.branoSelezionato = brano
      this.fotoArtista = null
      this.caricandoFoto = true
      const nomeArtista = brano.artist?.name || brano.artist
      try {
        const risposta = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nomeArtista)}`)
        const dati = await risposta.json()
        this.fotoArtista = dati.thumbnail?.source || null
      } catch {
        this.fotoArtista = null
      }
      this.caricandoFoto = false
    },
    chiudiModale() {
      this.branoSelezionato = null
      this.fotoArtista = null
    },
    aggiungiACoda() {
      this.playerStore.aggiungiACoda(this.branoSelezionato)
      this.chiudiModale()
    },
    async cercaBraniEsplora() {
      if (!this.query.trim()) {
        this.risultatiRicerca = []
        this.erroreLastFm = null
        return
      }
      try {
        const dati = await cercaBrani(this.query)
        this.risultatiRicerca = dati.results?.trackmatches?.track || []
        this.erroreLastFm = null
      } catch (error) {
        console.error('Errore ricerca brani:', error)
        this.risultatiRicerca = []
        this.erroreLastFm = 'Impossibile cercare brani. Controlla la connessione o riprova più tardi.'
      }
    },
    svuotaRicerca() {
      this.query = ''
      this.risultatiRicerca = []
      this.erroreLastFm = null
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

.errore-ultimo {
  color: var(--text-error);
  background: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.15);
  border-radius: var(--radius);
  padding: 12px 16px;
  margin-bottom: 12px;
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

.artista {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.riga-destra {
  display: flex;
  align-items: center;
  gap: 16px;
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
  margin-top: 8px;
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
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.artista-modale {
  font-size: 0.95rem;
  color: var(--accent);
  margin-bottom: 16px;
  font-weight: 600;
}

.stat {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.btn-coda {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: opacity 0.2s;
}

.btn-coda:hover { opacity: 0.85; }

.barra-ricerca {
  position: relative;
  margin-bottom: 20px;
}

.input-ricerca {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 40px 12px 16px;
  color: var(--text);
  font-size: 0.92rem;
  outline: none;
  font-family: "Inter", sans-serif;
  transition: border-color 0.2s;
}

.input-ricerca:focus {
  border-color: var(--accent);
}

.btn-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.btn-clear:hover { color: var(--text); }
</style>