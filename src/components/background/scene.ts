import {
    AdditiveBlending,
    BoxGeometry,
    CircleGeometry,
    Color,
    Curve,
    CylinderGeometry,
    DoubleSide,
    Group,
    InstancedMesh,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    RingGeometry,
    TubeGeometry,
    Vector3,
} from 'three'
import type { BufferGeometry, Material } from 'three'
import {
    APPROACH_RADIUS,
    APPROACH_START_AT,
    APPROACH_TARGET_Y,
    APPROACH_Y,
    ARCH_CLEARANCE,
    ARCH_COLOR,
    ARCH_EVERY_PANELS,
    ARCH_MIN_RADIUS,
    ARCH_THICKNESS,
    BEAM_COLOR,
    BEAM_COLOR_MOBILE,
    BEAM_CYCLE,
    BEAM_FADE_START,
    BEAM_FLARE,
    BEAM_GOLDEN_ANGLE,
    BEAM_GOLDEN_RATIO,
    BEAM_RADIAL_SEGMENTS,
    BEAM_RADIAL_SEGMENTS_MOBILE,
    BEAM_RADIUS,
    BEAM_RIBBONS,
    BEAM_RIBBONS_MOBILE,
    BEAM_RISE_SPEED,
    BEAM_SEGMENTS,
    BEAM_SEGMENTS_MOBILE,
    BEAM_SEGMENT_HEIGHT,
    BEAM_SPAWN_Y,
    BEAM_SPEED_SPREAD,
    BEAM_SPIN,
    BEAM_TUBE_RADIUS,
    BEAM_TURNS,
    CAMERA_HEIGHT,
    CAMERA_THETA_MIN,
    CHANNEL_WIDTH,
    CORE_RADIUS,
    DROP_COMPLETE_AT,
    DROP_DISTANCE,
    DROP_HEIGHT,
    EASE_POWER,
    END_MARGIN_VIEWPORTS,
    ENTRY_START_VIEWPORTS,
    ENTRY_VIEWPORTS,
    FLOOR_COLOR,
    FLOOR_MARGIN,
    FLOOR_SEGMENTS,
    FLOOR_SEGMENTS_MOBILE,
    LOOK_AHEAD_ARC,
    LOOK_TURN_START_AT,
    PALETTE_STRIDE,
    PANEL_ARC,
    PANEL_OVERLAP,
    PANEL_THICKNESS,
    PANEL_THICKNESS_JITTER,
    PANEL_THICKNESS_PATTERN,
    POINTER_TILT_X,
    POINTER_TILT_Y,
    REVEAL_FRACTION,
    TURNS,
    WALL_HEIGHT_INNER,
    WALL_HEIGHT_OUTER,
    WALL_THETA_MIN,
    WALL_ZONES,
    WELL_FLOOR_COLOR,
    WELL_LEVELS,
    WELL_LEVEL_HEIGHT,
    WELL_PALETTE,
    WELL_RADIUS,
    WELL_RADIUS_STEP,
    WELL_SEGMENTS,
    WELL_SEGMENTS_MOBILE,
} from './scene.config'
import type { SceneFactory } from './scene.types'

const TAU = Math.PI * 2
const HALF = 0.5
const HALF_CHANNEL = CHANNEL_WIDTH * HALF

// Spirale d'Archimède : le rayon croît linéairement avec l'angle, d'exactement une largeur
// de canal par tour. L'écart entre deux tours est donc constant.
const SPIRAL_A = CHANNEL_WIDTH / TAU
const THETA_TOTAL = TURNS * TAU
// La caméra doit garder un tour devant elle pour avoir une paroi extérieure.
const CAMERA_THETA_MAX = THETA_TOTAL - TAU

// Direction, dans le plan, de l'entrée du canal vue depuis le centre. C'est l'axe le long
// duquel la caméra descend et le long duquel la scène glisse jusqu'à sa place.
const ENTRY_DIR_X = Math.cos(CAMERA_THETA_MAX)
const ENTRY_DIR_Z = Math.sin(CAMERA_THETA_MAX)

const spiralRadius = (theta: number) => CORE_RADIUS + SPIRAL_A * theta

// Longueur d'arc depuis l'origine. On néglige dr/dθ devant r, qui vaut au minimum quatre
// fois plus : l'écart est sous le dixième de pour cent, très en deçà de la taille d'un
// panneau.
const arcAt = (theta: number) => CORE_RADIUS * theta + (SPIRAL_A * theta * theta) / 2

// Réciproque de arcAt, par résolution du trinôme.
const thetaAt = (arc: number) => (Math.sqrt(CORE_RADIUS * CORE_RADIUS + 2 * SPIRAL_A * arc) - CORE_RADIUS) / SPIRAL_A

const wallHeight = (radius: number) => {
    const outer = spiralRadius(THETA_TOTAL)
    const t = (radius - CORE_RADIUS) / (outer - CORE_RADIUS)
    return WALL_HEIGHT_INNER + (WALL_HEIGHT_OUTER - WALL_HEIGHT_INNER) * t
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

// Départ immédiat, arrivée amortie. C'est ce qu'il faut à la descente de la spirale : elle
// doit suivre le scroll dès le premier pixel, sans quoi la scène paraît figée pendant la
// première moitié du hero avant de se mettre en marche d'un coup.
const easeOut = (t: number) => 1 - Math.pow(1 - t, EASE_POWER)

// Amorti aux deux bouts. Réservé au déplacement de la caméra, qui doit s'ébranler
// doucement puis se poser : un départ sec sur un mouvement de cette amplitude est brutal.
const easeInOut = (t: number) =>
    t < HALF ? Math.pow(2 * t, EASE_POWER) / 2 : 1 - Math.pow(2 - 2 * t, EASE_POWER) / 2

// Les trois zones aplaties en une seule liste : un InstancedMesh par couleur, l'index d'un
// panneau valant zone × teintes + teinte.
const WALL_COLORS = WALL_ZONES.flat()
const TINTS_PER_ZONE = WALL_ZONES[0].length

// Hélice évasée : le ruban s'enroule autour de l'axe du puits en s'écartant à mesure qu'il
// monte. Évaluée analytiquement, donc TubeGeometry interpole exactement la courbe quel que
// soit le nombre de segments demandé.
class BeamCurve extends Curve<Vector3> {
    constructor(
        private radius: number,
        private height: number,
        private turns: number,
        private flare: number,
    ) {
        super()
    }

    getPoint(t: number, optionalTarget = new Vector3()) {
        const angle = t * this.turns * TAU
        const radius = this.radius * (1 + t * this.flare)
        return optionalTarget.set(Math.cos(angle) * radius, t * this.height, Math.sin(angle) * radius)
    }
}

type Panel = { theta: number; radius: number; height: number; thickness: number; palette: number }

// Zone de rayon, de la plus extérieure (sombre) à la plus centrale (claire).
const zoneFor = (radius: number) => {
    const outer = spiralRadius(THETA_TOTAL)
    const t = (radius - CORE_RADIUS) / (outer - CORE_RADIUS)
    return Math.min(WALL_ZONES.length - 1, Math.max(0, Math.floor((1 - t) * WALL_ZONES.length)))
}

const buildPanels = () => {
    const panels: Panel[] = []
    const arcTotal = arcAt(THETA_TOTAL)

    for (let index = 0, arc = 0; arc < arcTotal; index++, arc += PANEL_ARC) {
        const theta = thetaAt(arc)
        // Le canal débouche : au-delà de ce point, plus de mur intérieur entre la caméra et
        // le puits, seulement la paroi extérieure qu'on continue de longer.
        if (theta < WALL_THETA_MIN) continue

        const radius = spiralRadius(theta)
        const jitter = PANEL_THICKNESS_PATTERN[index % PANEL_THICKNESS_PATTERN.length] * PANEL_THICKNESS_JITTER

        panels.push({
            theta,
            radius,
            height: wallHeight(radius),
            thickness: PANEL_THICKNESS + jitter,
            palette: zoneFor(radius) * TINTS_PER_ZONE + ((index * PALETTE_STRIDE) % TINTS_PER_ZONE),
        })
    }

    return panels
}

export const createScene: SceneFactory = ({ scene, camera, isMobile }) => {
    const geometries: BufferGeometry[] = []
    const materials: Material[] = []
    const group = new Group()
    scene.add(group)

    const panels = buildPanels()
    const dummy = new Object3D()
    const panelGeometry = new BoxGeometry(1, 1, 1)
    geometries.push(panelGeometry)

    // Un InstancedMesh par teinte : douze appels de dessin pour deux cent cinquante
    // panneaux, là où un Mesh par panneau en coûterait autant qu'il y a de panneaux.
    const counts = WALL_COLORS.map((_, index) => panels.filter((panel) => panel.palette === index).length)
    const walls = WALL_COLORS.map((color, index) => {
        const material = new MeshBasicMaterial({ color: new Color(color) })
        materials.push(material)
        const mesh = new InstancedMesh(panelGeometry, material, counts[index])
        group.add(mesh)
        return mesh
    })

    const cursors = WALL_COLORS.map(() => 0)
    for (const panel of panels) {
        const x = Math.cos(panel.theta) * panel.radius
        const z = Math.sin(panel.theta) * panel.radius

        dummy.position.set(x, panel.height / 2, z)
        // Viser l'axe de la spirale aligne le côté profond du panneau sur le rayon, donc
        // sa largeur sur la tangente — sans avoir à dériver la courbe.
        dummy.lookAt(0, panel.height / 2, 0)
        dummy.scale.set(PANEL_ARC * PANEL_OVERLAP, panel.height, panel.thickness)
        dummy.updateMatrix()

        walls[panel.palette].setMatrixAt(cursors[panel.palette]++, dummy.matrix)
    }
    for (const wall of walls) wall.instanceMatrix.needsUpdate = true

    // Les arches sont les seuls éléments à traverser le champ de part en part : ce sont
    // elles qui donnent la vitesse. Écartées du centre, où les virages les tordraient.
    const archIndices = panels
        .map((panel, index) => ({ panel, index }))
        .filter(({ panel, index }) => index % ARCH_EVERY_PANELS === 0 && panel.radius > ARCH_MIN_RADIUS)

    const archMaterial = new MeshBasicMaterial({ color: new Color(ARCH_COLOR) })
    materials.push(archMaterial)
    const arches = new InstancedMesh(panelGeometry, archMaterial, archIndices.length)
    group.add(arches)

    archIndices.forEach(({ panel }, slot) => {
        const radius = panel.radius + HALF_CHANNEL
        dummy.position.set(
            Math.cos(panel.theta) * radius,
            wallHeight(panel.radius) + ARCH_CLEARANCE,
            Math.sin(panel.theta) * radius,
        )
        dummy.lookAt(0, wallHeight(panel.radius) + ARCH_CLEARANCE, 0)
        dummy.scale.set(ARCH_THICKNESS, ARCH_THICKNESS, CHANNEL_WIDTH)
        dummy.updateMatrix()
        arches.setMatrixAt(slot, dummy.matrix)
    })
    arches.instanceMatrix.needsUpdate = true

    // Le sol est troué en son centre : c'est l'ouverture du puits.
    const floorGeometry = new RingGeometry(
        WELL_RADIUS,
        spiralRadius(THETA_TOTAL) + FLOOR_MARGIN,
        isMobile ? FLOOR_SEGMENTS_MOBILE : FLOOR_SEGMENTS,
    )
    floorGeometry.rotateX(-Math.PI / 2)
    const floorMaterial = new MeshBasicMaterial({ color: new Color(FLOOR_COLOR) })
    geometries.push(floorGeometry)
    materials.push(floorMaterial)
    group.add(new Mesh(floorGeometry, floorMaterial))

    // Le puits, en gradins : chaque palier est un tronc de cône un peu plus étroit et un
    // peu plus clair que celui du dessus. Six aplats francs plutôt qu'un dégradé, et
    // aucune source montrée de face — depuis le canal on ne voit que les premiers paliers,
    // le fond ne se devine qu'en arrivant au bord.
    const wellSegments = isMobile ? WELL_SEGMENTS_MOBILE : WELL_SEGMENTS
    let wellTop = 0
    let wellRadius = WELL_RADIUS

    for (let level = 0; level < WELL_LEVELS; level++) {
        const bottomRadius = wellRadius - WELL_RADIUS_STEP
        const geometry = new CylinderGeometry(wellRadius, bottomRadius, WELL_LEVEL_HEIGHT, wellSegments, 1, true)
        // Doublé face : on regarde la paroi opposée du puits, donc son intérieur.
        const material = new MeshBasicMaterial({
            color: new Color(WELL_PALETTE[level % WELL_PALETTE.length]),
            side: DoubleSide,
        })
        geometries.push(geometry)
        materials.push(material)

        const mesh = new Mesh(geometry, material)
        mesh.position.y = wellTop - WELL_LEVEL_HEIGHT * HALF
        group.add(mesh)

        wellTop -= WELL_LEVEL_HEIGHT
        wellRadius = bottomRadius
    }

    const wellFloorGeometry = new CircleGeometry(wellRadius, wellSegments)
    wellFloorGeometry.rotateX(-Math.PI / 2)
    const wellFloorMaterial = new MeshBasicMaterial({ color: new Color(WELL_FLOOR_COLOR) })
    geometries.push(wellFloorGeometry)
    materials.push(wellFloorMaterial)
    const wellFloor = new Mesh(wellFloorGeometry, wellFloorMaterial)
    wellFloor.position.y = wellTop
    group.add(wellFloor)

    // Le faisceau : une farandole de rubans hélicoïdaux qui montent du fond du puits en
    // tournant et s'évaporent avant le haut du cadre. C'est lui qu'on aperçoit par-dessus
    // les murs bien avant d'atteindre le centre, et son mouvement continu détache la section
    // Contact du fond.
    //
    // Mélange additif : là où les rubans se croisent, leurs couleurs s'ajoutent et saturent
    // vers le blanc. La brillance naît donc de leur densité, sans halo dessiné ni passe de
    // post-traitement. depthWrite est coupé pour qu'ils ne se découpent pas entre eux selon
    // un ordre de rendu qui change avec l'angle de vue ; depthTest reste actif, de sorte que
    // le rebord du puits masque ceux qui n'en sont pas encore sortis.
    const beamSegments = isMobile ? BEAM_SEGMENTS_MOBILE : BEAM_SEGMENTS
    const beamRadial = isMobile ? BEAM_RADIAL_SEGMENTS_MOBILE : BEAM_RADIAL_SEGMENTS
    const ribbonCount = isMobile ? BEAM_RIBBONS_MOBILE : BEAM_RIBBONS
    const beamCurve = new BeamCurve(BEAM_RADIUS, BEAM_SEGMENT_HEIGHT, BEAM_TURNS, BEAM_FLARE)

    const beamGeometry = new TubeGeometry(beamCurve, beamSegments, BEAM_TUBE_RADIUS, beamRadial, false)
    const beamMaterial = new MeshBasicMaterial({
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
    })
    geometries.push(beamGeometry)
    materials.push(beamMaterial)

    // Une seule instance dessinée pour toute la farandole. L'intensité de chaque ruban passe
    // par sa couleur d'instance : en additif, une couleur sombre n'ajoute rien, elle tient
    // donc lieu d'opacité sans que le tri des transparents ait son mot à dire.
    const beam = new InstancedMesh(beamGeometry, beamMaterial, ribbonCount)
    // Les matrices d'instance changent à chaque frame, alors que la sphère englobante n'est
    // calculée qu'une fois : la laisser servir au culling ferait disparaître la farandole dès
    // que les rubans s'écartent de leur position initiale.
    beam.frustumCulled = false
    group.add(beam)

    const beamColor = new Color()
    const beamBase = new Color(isMobile ? BEAM_COLOR_MOBILE : BEAM_COLOR)
    // Répartition en angle d'or : aucun motif régulier ne se reforme, quel que soit le
    // nombre de rubans.
    // La vitesse de chacun est tirée de la partie fractionnaire des multiples du nombre
    // d'or : équirépartie, sans répétition, et identique d'un chargement à l'autre.
    const ribbonPhases = Array.from({ length: ribbonCount }, (_, index) => {
        const spread = ((index + 1) * BEAM_GOLDEN_RATIO) % 1
        return {
            angle: index * BEAM_GOLDEN_ANGLE,
            offset: (index / ribbonCount) * BEAM_CYCLE,
            speed: BEAM_RISE_SPEED * (1 - BEAM_SPEED_SPREAD * HALF + spread * BEAM_SPEED_SPREAD),
        }
    })

    for (let index = 0; index < ribbonCount; index++) beam.setColorAt(index, beamBase)

    // Cible fixe au centre de la spirale : la caméra ne suit pas son mouvement, sinon elle
    // la garderait centrée et la descente serait invisible.
    const approachTarget = new Vector3(0, APPROACH_TARGET_Y, 0)
    const channelTarget = new Vector3()
    const revealTarget = new Vector3()
    const position = new Vector3()
    const target = new Vector3()

    let elapsed = 0

    return {
        update: ({ viewports, viewportsTotal, delta, pointerX, pointerY }) => {
            elapsed += delta

            // Les rubans naissent au fond du puits, montent en continu et repartent d'en bas
            // une fois le cycle achevé. Aucun fondu à l'apparition : ils sortent masqués par
            // le rebord, et c'est ce qui donne l'impression qu'ils jaillissent du puits. Le
            // recyclage reste invisible parce qu'ils sont déjà éteints tout en haut.
            for (let index = 0; index < ribbonCount; index++) {
                const phase = ribbonPhases[index]
                const life = ((phase.offset + elapsed * phase.speed) % BEAM_CYCLE) / BEAM_CYCLE
                const fade = 1 - clamp01((life - BEAM_FADE_START) / (1 - BEAM_FADE_START))

                dummy.position.set(0, BEAM_SPAWN_Y + life * (BEAM_CYCLE - BEAM_SPAWN_Y), 0)
                dummy.rotation.set(0, phase.angle + elapsed * BEAM_SPIN, 0)
                dummy.scale.setScalar(1)
                dummy.updateMatrix()
                beam.setMatrixAt(index, dummy.matrix)

                beamColor.copy(beamBase).multiplyScalar(fade)
                beam.setColorAt(index, beamColor)
            }
            beam.instanceMatrix.needsUpdate = true
            if (beam.instanceColor) beam.instanceColor.needsUpdate = true

            // La séquence d'entrée démarre presque au premier pixel de scroll : la bande de
            // scène qui se découvre sous le hero doit montrer la spirale, pas un aplat vide.
            const entrySpan = ENTRY_VIEWPORTS - ENTRY_START_VIEWPORTS
            const entry = entrySpan > 0 ? clamp01((viewports - ENTRY_START_VIEWPORTS) / entrySpan) : 1
            const drop = easeOut(clamp01(entry / DROP_COMPLETE_AT))
            // La scène glisse vers sa place le long de l'axe caméra-centre, et non pas
            // seulement en hauteur : vue d'aplomb, une translation verticale ne déplace
            // presque rien à l'écran, alors qu'un décalage horizontal la fait descendre de
            // près de 40 % de la hauteur du cadre.
            const slide = (1 - drop) * DROP_DISTANCE
            group.position.set(-ENTRY_DIR_X * slide, (1 - drop) * DROP_HEIGHT, -ENTRY_DIR_Z * slide)

            // Progression dans le canal, mesurée en écrans plutôt qu'en fraction de page :
            // la traversée s'achève END_MARGIN_VIEWPORTS avant le bas du document, sinon le
            // centre ne serait atteint qu'au tout dernier pixel, footer compris.
            const tunnelSpan = viewportsTotal - END_MARGIN_VIEWPORTS - ENTRY_VIEWPORTS
            const tunnel = tunnelSpan > 0 ? clamp01((viewports - ENTRY_VIEWPORTS) / tunnelSpan) : 0

            const theta = CAMERA_THETA_MAX + (CAMERA_THETA_MIN - CAMERA_THETA_MAX) * tunnel
            const radius = spiralRadius(theta) + HALF_CHANNEL
            const eyeY = group.position.y + CAMERA_HEIGHT

            // On regarde le canal un peu plus loin vers le centre : le regard suit le
            // virage au lieu de couper à travers le mur.
            const aheadTheta = thetaAt(Math.max(0, arcAt(theta) - LOOK_AHEAD_ARC))
            const aheadRadius = spiralRadius(aheadTheta) + HALF_CHANNEL
            channelTarget.set(Math.cos(aheadTheta) * aheadRadius, eyeY, Math.sin(aheadTheta) * aheadRadius)

            // Sur la dernière portion, le regard se tourne vers le centre — mais reste à
            // l'horizontale, à hauteur d'œil. La caméra ne se penche pas dans le puits : elle
            // regarde dans sa direction et c'est le faisceau qui monte dans son champ. Le
            // puits n'est que la source, on ne doit pas se focaliser dessus.
            if (REVEAL_FRACTION > 0) {
                const reveal = easeInOut(clamp01((tunnel - (1 - REVEAL_FRACTION)) / REVEAL_FRACTION))
                revealTarget.set(0, eyeY, 0)
                channelTarget.lerp(revealTarget, reveal)
            }

            // L'approche est retardée puis amortie aux deux bouts : la caméra attend que la
            // spirale soit presque posée avant de se mettre en mouvement vers l'entrée.
            const approachSpan = 1 - APPROACH_START_AT
            const approach = easeInOut(clamp01((entry - APPROACH_START_AT) / approachSpan))

            // Descente en coordonnées polaires, à angle constant : la caméra tombe droit sur
            // l'entrée du canal. Interpoler deux positions cartésiennes lui faisait traverser
            // la scène en diagonale, d'où le demi-tour à l'arrivée.
            //
            // Le décalage du groupe est repris à hauteur de l'approche : tant que la caméra
            // est loin, elle vise le centre du monde ; une fois engagée, elle suit la scène
            // là où elle a glissé, sans quoi elle entrerait à côté du canal.
            const eyeRadius = APPROACH_RADIUS + (radius - APPROACH_RADIUS) * approach
            const eyeHeight = APPROACH_Y + (eyeY - APPROACH_Y) * approach
            const followX = group.position.x * approach
            const followZ = group.position.z * approach
            position.set(Math.cos(theta) * eyeRadius + followX, eyeHeight, Math.sin(theta) * eyeRadius + followZ)
            channelTarget.x += followX
            channelTarget.z += followZ

            // Le regard pivote plus tard que la descente : on contemple la spirale de face,
            // puis seulement on s'aligne sur l'axe du canal pour s'y engager.
            const lookTurn = easeInOut(clamp01((approach - LOOK_TURN_START_AT) / (1 - LOOK_TURN_START_AT)))
            target.lerpVectors(approachTarget, channelTarget, lookTurn)

            camera.position.copy(position)
            camera.lookAt(target)
            camera.rotateY(-pointerX * POINTER_TILT_Y)
            camera.rotateX(-pointerY * POINTER_TILT_X)
        },
        dispose: () => {
            scene.remove(group)
            for (const wall of walls) wall.dispose()
            arches.dispose()
            for (const geometry of geometries) geometry.dispose()
            for (const material of materials) material.dispose()
        },
    }
}
