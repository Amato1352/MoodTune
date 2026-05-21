<template>
  <div class="player">
    <h1 class="titolo-pagina">Player</h1>

    <div class="mini-player" v-if="branoDisplay">
      <div class="mini-info">
        <p class="mini-titolo">{{ branoDisplay.nome }}</p>
        <p class="mini-artista">{{ branoDisplay.artista }}</p>
      </div>
      <div class="mini-controlli">
        <button class="btn-controllo" @click="playerStore.inRiproduzione = !playerStore.inRiproduzione">
          {{ playerStore.inRiproduzione ? "⏸" : "▶" }}
        </button>
        <button class="btn-controllo" @click="playerStore.prossimoBrano()">⏭</button>
      </div>
    </div>

    <div class="mini-player vuoto" v-else>
      <p class="testo-vuoto">Nessun brano in riproduzione</p>
    </div>

    <div class="sezione-coda">
      <h2 class="titolo-sezione">In coda ({{ playerStore.coda.length }})</h2>

      <div class="coda-vuota" v-if="playerStore.coda.length === 0">
        <p>La coda è vuota. Aggiungi brani da Esplora o Playlist.</p>
      </div>

      <div class="lista-coda" v-else>
        <div class="riga" v-for="(brano, index) in playerStore.coda" :key="index">
          <div class="riga-info">
            <p class="nome">{{ brano.name || brano.titolo }}</p>
            <p class="artista">{{ brano.artist?.name || brano.artist || brano.artista }}</p>
          </div>
          <button class="btn-rimuovi" @click="playerStore.rimuoviDaCoda(index)">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usePlayerStore } from "../magazzino/player"

export default {
  setup() {
    const playerStore = usePlayerStore()
    return { playerStore }
  },

  computed: {
    branoDisplay() {
      const b = this.playerStore.branoCorrente
      if (!b) return null
      return {
        nome: b.name || b.titolo || "?",
        artista: b.artist?.name || b.artist || b.artista || ""
      }
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

.mini-player {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--accent);
  margin-bottom: 32px;
}

.mini-player.vuoto {
  border-color: var(--border);
  justify-content: center;
}

.testo-vuoto {
  color: var(--text-muted);
  font-size: 0.88rem;
}

.mini-titolo {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.mini-artista {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.mini-controlli {
  display: flex;
  gap: 10px;
}

.btn-controllo {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-controllo:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.sezione-coda { margin-top: 8px; }

.titolo-sezione {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.coda-vuota {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
  font-size: 0.88rem;
}

.lista-coda {
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
  border: 1px solid transparent;
  transition: all 0.2s;
  animation: fadeUp 0.3s ease both;
}
.riga:hover { border-color: var(--border); }

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
  font-size: 0.74rem;
  color: var(--text-muted);
}

.btn-rimuovi {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}
.btn-rimuovi:hover { color: #ff4444; }
</style>