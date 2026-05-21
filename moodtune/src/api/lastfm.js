import { config } from '../config'

export async function getTopBrani(pagina) {
  const risposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=chart.getTopTracks&api_key=${config.LASTFM_API_KEY}&format=json&page=${pagina}&limit=50`)
  const dati = await risposta.json()
  return dati
}

export async function getTopArtisti(pagina) {
  const risposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=${config.LASTFM_API_KEY}&format=json&page=${pagina}&limit=50`)
  const dati = await risposta.json()
  return dati
}

export async function cercaBrani(query) {
  const risposta = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${config.LASTFM_API_KEY}&format=json&limit=5`)
  const dati = await risposta.json()
  return dati
}