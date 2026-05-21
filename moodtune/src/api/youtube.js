import { config } from '../config'

export async function cercaVideo(brano, artista) {
  const risposta = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${brano} ${artista}&type=video&key=${config.YOUTUBE_API_KEY}`)
  const dati = await risposta.json()
  return dati
}