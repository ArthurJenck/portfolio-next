// Voile posé entre la scène 3D et le contenu des dernières sections. Le faisceau y est à
// son plus lumineux, et sans lui le texte passerait devant des rubans qui montent.
//
// Il est posé section par section plutôt qu'en un seul bloc couvrant About et Contact :
// un conteneur commun deviendrait l'offsetParent des deux, et FastTravel navigue justement
// avec element.offsetTop — ses ancres tomberaient à côté. La césure entre les deux voiles
// ne se voit pas tant qu'ils s'accordent sur la même opacité de palier.

const VEIL_OPACITY = 0.55
const FADE_END = '35%'

const SOLID = `rgba(0, 0, 0, ${VEIL_OPACITY})`
const FADE = `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, ${SOLID} ${FADE_END}, ${SOLID} 100%)`

const SceneVeil = ({ fade = false }: { fade?: boolean }) => (
    <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 pointer-events-none"
        style={{ background: fade ? FADE : SOLID }}
    />
)

export default SceneVeil
