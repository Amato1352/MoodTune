import { config } from '../config'

export async function generaPlaylist(descrizione) {
    const risposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `Genera una playlist di 10 brani basata su: ${descrizione}. Rispondi SOLO in JSON con questo formato: [{artista: '...', titolo: '...'}]`}]
            }]
        })
    })
    const dati = await risposta.json()
    return dati
}
