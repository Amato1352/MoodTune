import { defineStore } from "pinia"

export const usePlayerStore = defineStore("player", {
  state: () => ({
    branoCorrente: null,
    coda: [],
    inRiproduzione: false
  }),
  actions: {
    riproduci(brano) {
      this.branoCorrente = brano
      this.inRiproduzione = true
    },
    aggiungiACoda(brano) {
      if (!this.branoCorrente) {
        this.branoCorrente = brano
        this.inRiproduzione = true
      } else {
        this.coda.push(brano)
      }
    },
    rimuoviDaCoda(index) {
      this.coda.splice(index, 1)
    },
    prossimoBrano() {
      if (this.coda.length > 0) {
        this.branoCorrente = this.coda.shift()
        this.inRiproduzione = true
      } else {
        this.branoCorrente = null
        this.inRiproduzione = false
      }
    },
    setCoda(brani) {
      this.coda = [...brani]
    }
  }
})