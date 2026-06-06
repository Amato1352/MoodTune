import { config } from '../config'

const baseUrl = 'https://ws.audioscrobbler.com/2.0/'

async function callLastFm(params) {
  const url = new URL(baseUrl)
  url.search = new URLSearchParams({
    ...params,
    api_key: config.LASTFM_API_KEY.trim(),
    format: 'json'
  })

  const risposta = await fetch(url.toString())
  if (!risposta.ok) {
    throw new Error(`Last.fm request failed: ${risposta.status} ${risposta.statusText}`)
  }

  return risposta.json()
}

export async function getTopBrani(pagina) {
  return callLastFm({ method: 'chart.getTopTracks', page: pagina, limit: 50 })
}

export async function getTopArtisti(pagina) {
  return callLastFm({ method: 'chart.getTopArtists', page: pagina, limit: 50 })
}

export async function cercaBrani(query) {
  return callLastFm({ method: 'track.search', track: query, limit: 5 })
}
