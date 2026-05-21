<template>
  <div id="app">

    <!-- TOPBAR -->
    <header class="topbar">
      <div class="logo">
        <svg width="160" height="36" viewBox="0 0 160 36">
          <g transform="translate(18, 18)">
            <polygon points="0,-14 12,0 0,14 -12,0" fill="none" stroke="#ff6b00" stroke-width="1.5"/>
            <polygon points="0,-9 8,0 0,9 -8,0" fill="none" stroke="#00d4ff" stroke-width="1" opacity="0.6"/>
            <polygon points="-4,-6 9,0 -4,6" fill="#ff6b00"/>
          </g>
          <text x="36" y="13" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#ffffff" letter-spacing="-0.5">Mood</text>
          <text x="96" y="13" font-family="Inter, sans-serif" font-size="20" font-weight="800" fill="#ff6b00" letter-spacing="-0.5">Tune</text>
          <line x1="36" y1="24" x2="148" y2="24" stroke="#ff6b00" stroke-width="1.5" opacity="0.3"/>
          <line x1="36" y1="24" x2="62" y2="24" stroke="#00d4ff" stroke-width="1.5"/>
          <circle cx="152" cy="24" r="2.5" fill="#00d4ff"/>
        </svg>
      </div>
    </header>

    <!-- NAVBAR -->
    <nav class="navbar">
      <router-link to="/" class="nav-item">Esplora</router-link>
      <router-link to="/artisti" class="nav-item">Artisti</router-link>
      <router-link to="/playlist" class="nav-item">Playlist</router-link>
      <router-link to="/player" class="nav-item">Player</router-link>
    </nav>

    <!-- CONTENUTO -->
    <main>
      <router-view/>
    </main>

    <!-- PLAYER BAR -->
    <div class="player-bar" v-if="playerStore.branoCorrente">
      <div class="player-info">
        <p class="player-titolo">{{ playerStore.branoCorrente.name || playerStore.branoCorrente.titolo }}</p>
        <p class="player-artista">{{ playerStore.branoCorrente.artist?.name || playerStore.branoCorrente.artist || playerStore.branoCorrente.artista }}</p>
      </div>
      <div class="player-controlli">
        <button class="btn-player" @click="playerStore.inRiproduzione ? pausaVideo() : riprendiVideo()">
          {{ playerStore.inRiproduzione ? "⏸" : "▶" }}
        </button>
        <button class="btn-player" @click="playerStore.prossimoBrano()">⏭</button>
      </div>
      <div id="yt-player-container" style="position:fixed;bottom:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;"></div>
    </div>

  </div>
</template>

<script>
import { usePlayerStore } from "./magazzino/player"
import { cercaVideo } from "./api/youtube"

export default {
  setup() {
    const playerStore = usePlayerStore()
    return { playerStore }
  },

  data() {
    return {
      videoId: null,
      ytPlayer: null,
      ytReady: false
    }
  },

  mounted() {
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(tag)
    }
    window.onYouTubeIframeAPIReady = () => {
      this.ytReady = true
      if (this.videoId) this.creaPlayer(this.videoId)
    }
  },

  watch: {
    "playerStore.branoCorrente": async function(brano) {
      if (!brano) return
      const nomeBrano = brano.name || brano.titolo
      const nomeArtista = brano.artist?.name || brano.artist || brano.artista
      const dati = await cercaVideo(nomeBrano, nomeArtista)
      const nuovoId = dati.items?.[0]?.id?.videoId || null
      if (!nuovoId) return
      this.videoId = nuovoId
      this.playerStore.inRiproduzione = true
      if (this.ytReady) {
        if (this.ytPlayer) {
          this.ytPlayer.destroy()
          this.ytPlayer = null
          }
        this.creaPlayer(nuovoId)
      }
    },
    "playerStore.inRiproduzione": function(val) {
      if (val) {
        this.ytPlayer?.playVideo()
      } else {
        this.ytPlayer?.pauseVideo()
      }
    }
  },

  methods: {
    creaPlayer(videoId) {
      this.ytPlayer = new window.YT.Player("yt-player-container", {
        height: "1",
        width: "1",
        videoId: videoId,
        playerVars: { autoplay: 1, controls: 0 },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              if (this.playerStore.coda.length > 0) {
                this.playerStore.prossimoBrano()
              } else {
                this.playerStore.inRiproduzione = false
                this.playerStore.branoCorrente = null
              }
            }
          }
        }
      })
    },
    pausaVideo() {
      this.playerStore.inRiproduzione = false
      this.ytPlayer?.pauseVideo()
    },
    riprendiVideo() {
      this.playerStore.inRiproduzione = true
      this.ytPlayer?.playVideo()
    }
  }
}
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

:root {
  --bg: #0a0a0a;
  --surface: #111111;
  --surface2: #1a1a1a;
  --accent: #ff6b00;
  --accent2: #00d4ff;
  --text: #ffffff;
  --text-muted: #555555;
  --border: #222222;
  --radius: 10px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: "Inter", sans-serif;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

a { text-decoration: none; color: inherit; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* TOPBAR */
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 68px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  z-index: 200;
}

/* NAVBAR */
.navbar {
  position: fixed;
  top: 68px;
  left: 0;
  right: 0;
  height: 44px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  gap: 4px;
  z-index: 199;
  gap: 32px;
}

.nav-item {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.2s;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.nav-item:hover {
  color: var(--text);
  background: var(--surface2);
}

.nav-item.router-link-active {
  color: var(--accent);
  background: rgba(255, 107, 0, 0.08);
}

/* MAIN */
main {
  flex: 1;
  padding: 24px;
  margin-top: 112px;
  padding-bottom: 90px;
}

/* PLAYER BAR */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--surface);
  border-top: 1px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 198;
}

.player-info {
  flex: 1;
  overflow: hidden;
}

.player-titolo {
  font-weight: 700;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-artista {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.player-controlli {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-player {
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 1.2rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-player:hover {
  background: rgba(255, 107, 0, 0.15);
  color: var(--accent);
}
</style>