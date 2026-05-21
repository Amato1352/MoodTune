import { defineStore } from "pinia"

export const usePlaylistStore = defineStore("playlist", {
  state: () => ({
    playlists: []
  }),
  actions: {
    creaPlaylist(nome) {
      this.playlists.push({ nome, brani: [] })
    },
    aggiungiAPlaylist(indexPlaylist, brano) {
      this.playlists[indexPlaylist].brani.push(brano)
    },
    rimuoviDaPlaylist(indexPlaylist, indexBrano) {
      this.playlists[indexPlaylist].brani.splice(indexBrano, 1)
    },
    eliminaPlaylist(index) {
      this.playlists.splice(index, 1)
    }
  }
})