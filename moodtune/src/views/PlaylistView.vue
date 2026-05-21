<template>
  <div class="playlist-view">
    <div class="view-header">
      <h1 class="titolo-pagina">Playlist</h1>
      <button class="btn-crea" @click="apriModale">+ Nuova playlist</button>
    </div>

    <div v-if="playlistStore.playlists.length === 0" class="empty-state">
      <div class="empty-icon">♫</div>
      <p>Nessuna playlist ancora. Creane una!</p>
    </div>

    <div v-else class="lista">
      <div class="riga" v-for="playlist in playlistStore.playlists" :key="playlist.id" @click="apriPlaylist(playlist)">
        <div class="riga-info">
          <p class="nome">{{ playlist.nome }}</p>
          <p class="contatore">{{ playlist.brani.length }} brani</p>
        </div>
        <span class="freccia">→</span>
      </div>
    </div>

    <!-- MODALE DETTAGLIO PLAYLIST -->
    <div class="modale-overlay" v-if="playlistAperta" @click.self="chiudiPlaylist">
      <div class="modale">
        <button class="btn-chiudi" @click="chiudiPlaylist">✕</button>
        <div class="modale-contenuto">
          <div class="modale-foto">
            <div class="foto-placeholder">♫</div>
          </div>
          <div class="modale-info">
            <div v-if="!modificaNome" class="nome-playlist-wrapper">
              <h2>{{ playlistAperta.nome }}</h2>
              <button class="btn-rinomina" @click="avviaModificaNome">Rinomina</button>
            </div>
            <div v-else class="rinomina-wrapper">
              <input class="campo-input" v-model="nuovoNome" @keyup.enter="salvaNome" />
              <button class="btn-riproduci" @click="salvaNome">Salva</button>
            </div>
            <p class="stat">{{ playlistAperta.brani.length }} brani</p>
            <button class="btn-riproduci" :disabled="playlistAperta.brani.length === 0" @click="riproduciPlaylist(playlistAperta)">
              Riproduci playlist
            </button>
            <button class="btn-elimina" @click="eliminaPlaylist(playlistAperta)">Elimina</button>
          </div>
        </div>

        <div class="lista-brani-modale" v-if="playlistAperta.brani.length > 0">
          <div class="brani-header">Brani</div>
          <div class="riga-brano" v-for="(brano, index) in playlistAperta.brani" :key="index" @click="riproduciSingolo(brano)">
            <span class="brano-num">{{ index + 1 }}</span>
            <div class="brano-testo">
              <span class="brano-titolo">{{ brano.titolo }}</span>
              <span class="brano-artista">{{ brano.artista }}</span>
            </div>
            <span class="play-icon">▶</span>
          </div>
        </div>

        <div class="coda-vuota" v-else>
          <p>Nessun brano in questa playlist.</p>
        </div>

        <div class="sezione-aggiungi">
          <div class="brani-header">Aggiungi brani</div>
          <input
            class="campo-input"
            v-model="queryAggiunta"
            placeholder="Cerca un brano..."
            @input="cercaBraniAggiunta"
          />
          <div class="risultati-ricerca" v-if="risultatiAggiunta.length > 0">
            <div
              class="risultato"
              v-for="(brano, i) in risultatiAggiunta"
              :key="i"
              @click="aggiungiBranoAPlaylist(brano)"
            >
              <div class="brano-testo">
                <span class="brano-titolo">{{ brano.name }}</span>
                <span class="brano-artista">{{ brano.artist }}</span>
              </div>
              <span class="risultato-aggiungi">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALE CREAZIONE PLAYLIST -->
    <div class="modale-overlay" v-if="modaleCreazione" @click.self="chiudiModale">
      <div class="modale">
        <button class="btn-chiudi" @click="chiudiModale">✕</button>
        <h2 class="modale-titolo">Nuova Playlist</h2>

        <div class="campo-gruppo">
          <label class="campo-label">Nome playlist</label>
          <input class="campo-input" v-model="nomePlaylist" placeholder="Es. Chill di domenica..." />
        </div>

        <div class="tab-bar">
          <button :class="['tab-btn', { attivo: modalitaCrea === 'manuale' }]" @click="modalitaCrea = 'manuale'">Manuale</button>
          <button :class="['tab-btn', { attivo: modalitaCrea === 'ai' }]" @click="modalitaCrea = 'ai'">Genera con AI</button>
        </div>

        <div v-if="modalitaCrea === 'ai'" class="sezione-ai">
          <label class="campo-label">Descrivi il tuo mood</label>
          <textarea class="campo-textarea" v-model="prompt" placeholder="Es. Musica per studiare di notte... oppure: mi sento energetico!" rows="4"></textarea>
          <button class="btn-genera" @click="generaConAI" :disabled="caricamento || !prompt.trim()">
            <span v-if="caricamento">Generando...</span>
            <span v-else>Genera playlist</span>
          </button>
          <div v-if="errore" class="errore-ai">{{ errore }}</div>

          <div v-if="braniGenerati.length > 0" class="brani-generati">
            <div class="brani-generati-header">
              <span>{{ braniGenerati.length }} brani generati</span>
              <button class="btn-aggiungi-tutti" @click="aggiungiTuttiAI">Aggiungi tutti +</button>
            </div>
            <div class="brano-generato" v-for="(brano, i) in braniGenerati" :key="i">
              <div class="brano-testo">
                <span class="brano-titolo">{{ brano.titolo || brano.title }}</span>
                <span class="brano-artista">{{ brano.artista || brano.artist }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="modalitaCrea === 'manuale'" class="sezione-manuale">
          <div class="campo-gruppo">
            <label class="campo-label">Cerca un brano</label>
            <input class="campo-input" v-model="queryRicerca" placeholder="Es. Bohemian Rhapsody..." @input="cercaBraniManuale" />
          </div>

          <div class="risultati-ricerca" v-if="risultatiRicerca.length > 0">
            <div class="risultato" v-for="(brano, i) in risultatiRicerca" :key="i" @click="aggiungiBranoManuale(brano)">
              <div class="brano-testo">
                <span class="brano-titolo">{{ brano.name }}</span>
                <span class="brano-artista">{{ brano.artist }}</span>
              </div>
              <span class="risultato-aggiungi">+</span>
            </div>
          </div>
        </div>

        <div v-if="nuoviBrani.length > 0" class="brani-aggiunti">
          <div class="brani-aggiunti-header">Brani da aggiungere ({{ nuoviBrani.length }})</div>
          <div class="brano-aggiunto" v-for="(brano, i) in nuoviBrani" :key="i">
            <span class="brano-num">{{ i + 1 }}</span>
            <span class="brano-nome">{{ brano.titolo }} — {{ brano.artista }}</span>
            <button class="btn-rimuovi" @click="nuoviBrani.splice(i, 1)">✕</button>
          </div>
        </div>

        <div class="modale-footer">
          <button class="btn-salva" @click="salvaPlaylist" :disabled="!(nomePlaylist && nomePlaylist.trim()) || nuoviBrani.length === 0">
            Salva playlist
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { cercaBrani } from "../api/lastfm"
import { usePlaylistStore } from "../magazzino/playlist"
import { usePlayerStore } from "../magazzino/player"

export default {
  setup() {
    const playlistStore = usePlaylistStore()
    const playerStore = usePlayerStore()
    return { playlistStore, playerStore }
  },

  data() {
    return {
      modaleCreazione: false,
      playlistAperta: null,
      modificaNome: false,
      nuovoNome: '',
      queryAggiunta: '',
      risultatiAggiunta: [],
      modalitaCrea: "manuale",
      prompt: "",
      nomePlaylist: "",
      braniGenerati: [],
      caricamento: false,
      errore: "",
      nuoviBrani: [],
      queryRicerca: "",
      risultatiRicerca: []
    }
  },

  methods: {
    apriPlaylist(playlist) {
      this.playlistAperta = playlist
    },
    chiudiPlaylist() {
      this.playlistAperta = null
      this.modificaNome = false
      this.nuovoNome = ''
      this.queryAggiunta = ''
      this.risultatiAggiunta = []
    },
    avviaModificaNome() {
      this.nuovoNome = this.playlistAperta.nome
      this.modificaNome = true
    },
    salvaNome() {
      if (!this.nuovoNome.trim()) return
      this.playlistAperta.nome = this.nuovoNome
      this.modificaNome = false
    },
    async cercaBraniAggiunta() {
      if (!this.queryAggiunta.trim()) {
        this.risultatiAggiunta = []
        return
      }
      const dati = await cercaBrani(this.queryAggiunta)
      this.risultatiAggiunta = dati.results?.trackmatches?.track || []
    },
    aggiungiBranoAPlaylist(brano) {
      this.playlistAperta.brani.push({
        titolo: brano.name,
        artista: brano.artist
      })
      this.queryAggiunta = ''
      this.risultatiAggiunta = []
    },
    riproduciPlaylist(playlist) {
      if (playlist.brani.length === 0) return
      const [primo, ...resto] = playlist.brani
      this.playerStore.riproduci(primo)
      this.playerStore.setCoda(resto)
      this.chiudiPlaylist()
      this.$router.push("/player")
    },
    riproduciSingolo(brano) {
      this.playerStore.riproduci(brano)
      this.chiudiPlaylist()
      this.$router.push("/player")
    },
    eliminaPlaylist(playlist) {
      const index = this.playlistStore.playlists.findIndex(p => p.id === playlist.id)
      if (index !== -1) this.playlistStore.eliminaPlaylist(index)
      this.chiudiPlaylist()
    },
    apriModale() {
      this.modaleCreazione = true
    },
    chiudiModale() {
      this.modaleCreazione = false
      this.prompt = ""
      this.nomePlaylist = ""
      this.nuoviBrani = []
      this.braniGenerati = []
      this.errore = ""
      this.modalitaCrea = "manuale"
      this.queryRicerca = ""
      this.risultatiRicerca = []
    },
    salvaPlaylist() {
      if (!this.nomePlaylist.trim() || this.nuoviBrani.length === 0) return
      this.playlistStore.playlists.push({
        id: Date.now(),
        nome: this.nomePlaylist,
        brani: [...this.nuoviBrani]
      })
      this.chiudiModale()
    },
    async generaConAI() {
      if (!this.prompt.trim()) return
      this.caricamento = true
      this.errore = ""
      this.braniGenerati = []
      try {
        const { generaPlaylist } = await import("@/api/gemini")
        const dati = await generaPlaylist(this.prompt)
        const testo = dati.candidates[0].content.parts[0].text
        const pulito = testo.replace(/```json|```/g, "").trim()
        this.braniGenerati = JSON.parse(pulito)
      } catch {
        this.errore = "Errore nella generazione AI. Riprova."
      }
      this.caricamento = false
    },
    aggiungiTuttiAI() {
      this.nuoviBrani = [...this.braniGenerati.map(b => ({
        titolo: b.titolo || b.title,
        artista: b.artista || b.artist
      }))]
    },
    async cercaBraniManuale() {
      if (!this.queryRicerca.trim()) {
        this.risultatiRicerca = []
        return
      }
      const dati = await cercaBrani(this.queryRicerca)
      this.risultatiRicerca = dati.results?.trackmatches?.track || []
    },
    aggiungiBranoManuale(brano) {
      this.nuoviBrani.push({ titolo: brano.name, artista: brano.artist })
      this.queryRicerca = ""
      this.risultatiRicerca = []
    }
  }
}
</script>

<style scoped>
.titolo-pagina {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.btn-crea {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: "Inter", sans-serif;
}
.btn-crea:hover { opacity: 0.85; }

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  opacity: 0.3;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
}
.riga:hover {
  border-color: var(--accent);
  transform: translateX(4px);
}

.nome {
  font-weight: 600;
  font-size: 0.92rem;
  margin-bottom: 3px;
}
.contatore {
  font-size: 0.74rem;
  color: var(--accent2);
  font-weight: 500;
}
.freccia {
  color: var(--text-muted);
  transition: transform 0.2s;
}
.riga:hover .freccia {
  transform: translateX(4px);
  color: var(--accent);
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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
  margin-bottom: 24px;
}

.modale-foto {
  width: 140px;
  min-width: 140px;
  height: 140px;
  border-radius: var(--radius);
  overflow: hidden;
}

.foto-placeholder {
  width: 100%;
  height: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.nome-playlist-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.nome-playlist-wrapper h2 {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.btn-rinomina {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-rinomina:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.rinomina-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.stat {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.btn-riproduci {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-bottom: 8px;
  font-family: "Inter", sans-serif;
}
.btn-riproduci:hover:not(:disabled) { opacity: 0.85; }
.btn-riproduci:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-elimina {
  display: block;
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "Inter", sans-serif;
}
.btn-elimina:hover {
  border-color: #ff4444;
  color: #ff4444;
}

.lista-brani-modale {
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.brani-header {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.riga-brano {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.riga-brano:hover { background: var(--surface2); }
.riga-brano:hover .play-icon { opacity: 1; color: var(--accent); }

.brano-num {
  width: 20px;
  font-size: 0.74rem;
  color: var(--text-muted);
  text-align: center;
  flex-shrink: 0;
}

.brano-testo { flex: 1; overflow: hidden; }

.brano-titolo {
  display: block;
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brano-artista {
  display: block;
  font-size: 0.74rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-icon {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.coda-vuota {
  text-align: center;
  padding: 20px 0;
  color: var(--text-muted);
  font-size: 0.88rem;
  border-top: 1px solid var(--border);
}

.sezione-aggiungi {
  border-top: 1px solid var(--border);
  padding-top: 16px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modale-titolo {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
}

.campo-gruppo { margin-bottom: 14px; }

.campo-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.campo-input {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  color: var(--text);
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  font-family: "Inter", sans-serif;
}
.campo-input:focus { border-color: var(--accent); }

.tab-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 18px;
  background: var(--surface2);
  border-radius: 8px;
  padding: 3px;
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  border-radius: 6px;
  padding: 9px;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "Inter", sans-serif;
}
.tab-btn.attivo {
  background: var(--accent);
  color: white;
}

.sezione-ai {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.campo-textarea {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  color: var(--text);
  font-size: 0.9rem;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
  transition: border-color 0.2s;
}
.campo-textarea:focus { border-color: var(--accent); }

.btn-genera {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
  font-family: "Inter", sans-serif;
}
.btn-genera:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-genera:not(:disabled):hover { opacity: 0.85; }

.errore-ai {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 0.82rem;
  color: #ff6666;
}

.brani-generati {
  background: var(--surface2);
  border-radius: 8px;
  overflow: hidden;
}
.brani-generati-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
}
.btn-aggiungi-tutti {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  font-family: "Inter", sans-serif;
}
.brano-generato {
  padding: 9px 12px;
  border-bottom: 1px solid var(--border);
}
.brano-generato:last-child { border-bottom: none; }

.risultati-ricerca {
  background: var(--surface2);
  border-radius: 8px;
  overflow: hidden;
}
.risultato {
  padding: 9px 12px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s;
}
.risultato:last-child { border-bottom: none; }
.risultato:hover { background: var(--surface); }
.risultato-aggiungi {
  color: var(--accent);
  font-size: 1.1rem;
  font-weight: 700;
}

.brani-aggiunti {
  background: var(--surface2);
  border-radius: 8px;
  padding: 10px;
  margin-top: 14px;
}
.brani-aggiunti-header {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
}
.brano-aggiunto {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
}
.brano-nome {
  flex: 1;
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.btn-rimuovi {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.82rem;
  transition: color 0.2s;
}
.btn-rimuovi:hover { color: #ff4444; }

.sezione-manuale {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modale-footer {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.btn-salva {
  width: 100%;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: "Inter", sans-serif;
}
.btn-salva:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-salva:not(:disabled):hover { opacity: 0.85; }
</style>