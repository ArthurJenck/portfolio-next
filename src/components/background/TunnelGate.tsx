import { TUNNEL_GATE_CLASS } from './scene.config'

// Respiration entre le hero et les Compétences : c'est pendant ce bloc que la spirale
// tombe et que la caméra vient se placer à l'entrée du canal. Purement décoratif, donc
// masqué aux lecteurs d'écran, et sans aucun JS — la hauteur et son retrait sous
// prefers-reduced-motion tiennent en CSS.
const TunnelGate = () => <div aria-hidden="true" className={TUNNEL_GATE_CLASS} />

export default TunnelGate
