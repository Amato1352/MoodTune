import { createRouter, createWebHistory } from "vue-router"
import EsploraView from "../views/EsploraView.vue"
import ArtistiView from "../views/ArtistiView.vue"
import PlaylistView from "../views/PlaylistView.vue"
import PlayerView from "../views/PlayerView.vue"

const routes = [
  { path: "/", name: "esplora", component: EsploraView },
  { path: "/artisti", name: "artisti", component: ArtistiView },
  { path: "/playlist", name: "playlist", component: PlaylistView },
  { path: "/player", name: "player", component: PlayerView }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router