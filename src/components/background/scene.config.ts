// Variante « tunnel » : une spirale d'Archimède extrudée, parcourue de l'extérieur vers
// le centre. La caméra descend dans le canal, un mur de chaque côté.
//
// Deux partis pris de géométrie, tous deux voulus :
//
// L'écart entre deux tours est constant, donc le canal ne se resserre jamais. Ce sont les
// virages qui deviennent de plus en plus serrés à l'approche du centre : on gagne une
// accélération perçue sans jamais toucher à la vitesse de scroll, et le canal reste assez
// large pour qu'on lise le contenu du site par-dessus.
//
// La hauteur des murs décroît vers le centre. On entre donc dans un couloir profond qui
// enferme, et l'on finit par dominer l'enroulement entier : les tours suivants dépassent
// par-dessus le mur intérieur, à des distances croissantes. C'est cette superposition de
// crêtes qui porte le parallaxe, avec le fait qu'en virage le mur intérieur défile
// beaucoup plus vite que le mur extérieur.

// Rayon de la paroi au tout premier tour, et écart constant entre deux tours successifs :
// c'est aussi la largeur du canal.
export const CORE_RADIUS = 4
export const CHANNEL_WIDTH = 6
export const TURNS = 3.5

// La caméra ne peut pas parcourir le dernier tour : au-delà, il n'y a plus de paroi
// extérieure pour fermer le canal.
export const CAMERA_THETA_MIN = 0.6
// Les murs ne descendent pas jusqu'au premier tour : le canal débouche tout à la fin.
//
// Sans cette coupure, le mur intérieur du dernier tour se dresse entre la caméra et le
// puits, à hauteur d'œil exactement, et masque entièrement l'ouverture. Mais la couper trop
// tôt est tout aussi mauvais : on longe alors le vide sur toute une portion du parcours,
// sans plus rien à gauche. La valeur est donc calée juste au-dessus de CAMERA_THETA_MIN —
// le mur accompagne jusqu'au bout et ne s'efface qu'à l'arrivée.
export const WALL_THETA_MIN = 1.2
export const CAMERA_HEIGHT = 1.7
// Distance à laquelle la caméra regarde devant elle, en longueur d'arc. Courte, pour que
// le regard suive vraiment le virage plutôt que de couper à travers le mur.
export const LOOK_AHEAD_ARC = 5

// Le mur n'est pas une surface continue mais une suite de panneaux : c'est ce qui donne
// les arêtes verticales et le défilement, là où une paroi lisse en aplat uni ne serait
// qu'un à-plat de couleur sans information.
export const PANEL_ARC = 1.2
// Léger chevauchement, sans quoi les virages serrés du centre ouvriraient des fentes
// entre panneaux tangents.
export const PANEL_OVERLAP = 1.15
export const PANEL_THICKNESS = 0.5
// Débord radial alterné d'un panneau à l'autre : les pilastres qui cassent le mur nu.
// Motif de longueur première avec le pas de palette, pour que couleur et relief ne
// retombent jamais en phase.
export const PANEL_THICKNESS_JITTER = 0.16
export const PANEL_THICKNESS_PATTERN: readonly number[] = [0, 1, -1, 1, 0, -1, 1, -1, 0, 1, -1]

export const WALL_HEIGHT_OUTER = 6
export const WALL_HEIGHT_INNER = 1.6

// Trois zones de rayon, chacune avec ses quatre aplats. Les panneaux s'éclaircissent à
// mesure qu'on se rapproche du centre — non pas par une animation, mais parce que les murs
// du centre sont peints plus clairs dès la construction. On les aperçoit donc de loin, par
// -dessus les murs intérieurs, bien avant d'y arriver : l'effet précède la cause, et c'est
// tout ce qui reste à faire pour que la lumière du puits paraisse rayonner.
// Ordre : de la zone extérieure à la zone centrale.
export const WALL_ZONES: readonly (readonly number[])[] = [
    [0x2c253e, 0x241e33, 0x342b47, 0x1c182a],
    [0x413659, 0x362c4b, 0x4b3d66, 0x2e2642],
    [0x5f5080, 0x51446f, 0x6d5c91, 0x453a5f],
]
export const PALETTE_STRIDE = 7

export const FLOOR_COLOR = 0x161329
export const FLOOR_SEGMENTS = 64
export const FLOOR_SEGMENTS_MOBILE = 32
export const FLOOR_MARGIN = 8

// Le puits. Le sol ne se referme pas au centre : il s'ouvre, et la spirale se poursuit
// hors de vue en dessous. On ne montre jamais la source de face — seulement des gradins
// qui s'enfoncent en s'éclaircissant, ce qui laisse deviner qu'il y a plus en dessous.
export const WELL_RADIUS = 3.4
export const WELL_LEVELS = 6
export const WELL_LEVEL_HEIGHT = 0.9
// Chaque gradin est un peu plus étroit que le précédent : l'entonnoir guide le regard vers
// le fond sans qu'on ait besoin de l'éclairer.
export const WELL_RADIUS_STEP = 0.3
export const WELL_SEGMENTS = 48
export const WELL_SEGMENTS_MOBILE = 24
// Du violet des murs jusqu'au presque-blanc. Six paliers francs, aucun dégradé.
export const WELL_PALETTE: readonly number[] = [0x6d5c91, 0x8574a8, 0x9d8ec0, 0xb5aad4, 0xcdc6e6, 0xe4e0f2]
// Le fond n'est pas blanc pur : il doit rester une lueur, pas une lampe.
export const WELL_FLOOR_COLOR = 0xf1eefa

// Le faisceau. C'est lui qui porte la lumière, pas le puits lui-même : une farandole de
// rubans hélicoïdaux qui montent du fond du puits en tournant et s'évaporent avant le haut
// du cadre. C'est ce mouvement continu qui fait vivre la fin du parcours et qui détache la
// section Contact du fond.
//
// La luminosité vient du mélange additif, pas d'un halo dessiné : là où les rubans se
// croisent, leurs couleurs s'ajoutent et saturent vers le blanc. La brillance naît donc de
// leur densité, ce qui donne un cœur intense et des franges douces sans aucune passe de
// post-traitement. Un tube de halo autour de chaque ruban, l'approche précédente, ne
// donnait qu'un contour terne.
//
// Tous les rubans partagent une géométrie et un matériau : un seul appel de dessin pour la
// farandole entière, l'intensité de chacun passant par sa couleur d'instance — en additif,
// une couleur sombre revient à être invisible.
// Beaucoup moins de rubans sur mobile, et ce n'est pas une question de triangles : ils sont
// transparents et n'écrivent pas la profondeur, donc chaque pixel est mélangé autant de fois
// qu'il y a de rubans superposés. C'est ce coût de remplissage qui pèse sur un GPU mobile en
// rendu par tuiles, et diviser leur nombre par quatre le divise d'autant.
export const BEAM_RIBBONS = 48
export const BEAM_RIBBONS_MOBILE = 12
export const BEAM_RADIUS = 2
// Évasement : le ruban s'écarte de l'axe en montant, comme une fumée qui se disperse.
export const BEAM_FLARE = 0.55
export const BEAM_TURNS = 0.8
export const BEAM_SEGMENT_HEIGHT = 5
export const BEAM_TUBE_RADIUS = 0.055
export const BEAM_SEGMENTS = 28
export const BEAM_SEGMENTS_MOBILE = 14
export const BEAM_RADIAL_SEGMENTS = 4
export const BEAM_RADIAL_SEGMENTS_MOBILE = 3

// Les rubans naissent au fond du puits, sous le niveau du sol, et non au-dessus : ils
// apparaissent donc masqués par le rebord et semblent vraiment en sortir. Aucun fondu à
// l'apparition — c'est le puits qui les cache, et un fondu trahirait le procédé.
//
// La valeur tient compte de ce qu'on voit réellement dans l'ouverture : depuis le canal, le
// regard plonge jusqu'à environ -1,4 au centre du puits. Un ruban dont le sommet naîtrait au
// ras du sol apparaîtrait donc d'un coup. En naissant ici, il est entièrement sous cette
// ligne et émerge progressivement.
export const BEAM_SPAWN_Y = -7
// Hauteur atteinte avant recyclage. Le ruban y est déjà entièrement évaporé.
export const BEAM_CYCLE = 15
export const BEAM_RISE_SPEED = 1.5
// Dispersion des vitesses de montée, en fraction de la vitesse de base. Sans elle, les
// rubans gardent éternellement leurs écarts de départ et l'ensemble monte comme un bloc ;
// avec, ils se croisent, se rattrapent et se distancent, et la farandole cesse d'être un
// motif pour devenir un flux.
export const BEAM_SPEED_SPREAD = 0.55
export const BEAM_SPIN = 0.22
// Fraction de la course à partir de laquelle le ruban commence à s'évaporer.
export const BEAM_FADE_START = 0.5

// Angle d'or : réparti les rubans autour de l'axe sans jamais retomber sur un motif
// régulier, ce qui serait immédiatement lu comme mécanique. Sa partie fractionnaire sert
// aussi à tirer les vitesses — une suite équirépartie et déterministe, donc identique d'un
// chargement à l'autre, là où un tirage aléatoire donnerait une scène différente à chaque
// visite sans rien apporter.
export const BEAM_GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
export const BEAM_GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2

// Teinte modérée : en additif, ce sont les croisements qui montent vers le blanc. Partir
// d'un blanc saturerait tout le faisceau d'un bloc.
//
// La variante mobile est plus claire pour compenser la moindre densité : avec quatre fois
// moins de rubans, il y a quatre fois moins de croisements, et le faisceau paraîtrait fade
// à teinte égale. La compensation reste partielle — l'idée est de retrouver une intensité
// comparable, pas de saturer un cœur qui n'existe plus.
export const BEAM_COLOR = 0x8f7fc4
export const BEAM_COLOR_MOBILE = 0xb9a6e0

// Sur la dernière portion du parcours, le regard se tourne vers le centre. Il reste
// horizontal : la caméra ne se penche pas dans le puits, elle regarde simplement dans sa
// direction, et c'est le faisceau qui monte dans son champ. Le puits n'est que la source,
// on ne doit jamais se focaliser dessus.
export const REVEAL_FRACTION = 0.2

// Arches enjambant le canal. Elles ne servent qu'à donner la vitesse : ce sont les seuls
// éléments à traverser le champ de part en part.
export const ARCH_EVERY_PANELS = 9
export const ARCH_MIN_RADIUS = 11
export const ARCH_COLOR = 0x4c3a6b
export const ARCH_THICKNESS = 0.34
export const ARCH_CLEARANCE = 0.5

// Hauteur de scroll consacrée à l'entrée, en écrans : le hero puis le bloc de transition.
// Doit rester accordée à la hauteur de TunnelGate.
export const ENTRY_VIEWPORTS = 1.8
// Le bloc de respiration inséré entre le hero et les Compétences, pendant lequel la spirale
// arrive et la caméra vient se placer.
//
// Sa hauteur vaut ENTRY_VIEWPORTS × 100svh, et ce n'est pas un hasard : les Compétences
// doivent commencer à poindre en bas de l'écran au moment précis où la caméra atteint
// l'entrée du canal. Comme le bloc suit un hero de 100svh, cela se produit exactement quand
// on a scrollé la hauteur du bloc. Les deux valeurs doivent donc rester accordées.
//
// Classe littérale pour rester détectable par Tailwind. Il disparaît sous
// prefers-reduced-motion, où la scène 3D ne tourne pas non plus : personne ne doit scroller
// à travers un vide qui ne raconte rien.
export const TUNNEL_GATE_CLASS = 'h-[150svh] w-full motion-reduce:hidden'
// Début de la séquence d'entrée, en écrans scrollés. Nul, et c'est délibéré : la scène doit
// translater dès le premier pixel de scroll. Démarrer plus tard donnait une scène qui
// paraissait figée pendant la première moitié du hero, puis se mettait en marche d'un coup.
export const ENTRY_START_VIEWPORTS = 0
// La séquence s'achève une fois le tunnel entièrement traversé. Le centre n'est donc pas
// atteint au tout dernier pixel du document, footer compris — auquel cas on ne l'atteindrait
// jamais confortablement — mais avant About, ce qui laisse contempler le puits pendant qu'on
// lit les coordonnées de contact.
export const END_MARGIN_VIEWPORTS = 0.15

// Hauteur d'où la spirale descend, et position de la caméra pendant qu'elle la regarde
// arriver, avant de venir se placer à l'entrée du canal.
//
// La caméra est haute, lointaine et presque à l'aplomb du centre : la spirale est vue de
// face, son enroulement se lit d'un coup d'œil, et de cette distance on n'en distingue pas
// les panneaux — c'est exactement ce qu'on veut avant d'y entrer. Le rayon n'est pas nul
// parce qu'une visée strictement verticale dégénère : lookAt n'a plus d'orientation définie
// quand l'axe de vue est parallèle à l'axe up.
//
// La scène n'arrive pas en tombant verticalement mais en glissant horizontalement, dans
// l'axe qui va de la caméra au centre. C'est contre-intuitif et pourtant c'est ce qui donne
// le plus de mouvement : vue d'aplomb, une translation verticale ne déplace presque rien à
// l'écran (8 % de la hauteur sur toute la course), alors qu'une translation horizontale de
// 38 unités écarte la scène de 17,7° de l'axe optique sur un demi-champ de 22,5°, soit près
// de 40 % de la hauteur d'écran. On garde donc la vue de face et le mouvement.
export const DROP_DISTANCE = 38
//
// Le rayon d'approche remplace une position cartésienne : la caméra descend à angle
// constant, exactement au-dessus de l'entrée du canal. Une interpolation en ligne droite lui
// faisait traverser toute la scène en diagonale, et le demi-tour à l'arrivée était le
// symptôme de ce raccourci.
export const DROP_HEIGHT = 12
export const APPROACH_Y = 105
export const APPROACH_RADIUS = 24
// La cible reste fixe au centre pendant l'approche. Si elle suivait la spirale, la caméra la
// garderait centrée et on ne la verrait jamais descendre.
export const APPROACH_TARGET_Y = 0
export const EASE_POWER = 3
// La descente s'achève avant l'approche : la spirale se pose d'abord, la caméra vient
// ensuite se glisser à l'entrée du canal. Les faire coïncider donnerait une caméra qui
// descend en même temps que le sol, donc un mouvement illisible.
export const DROP_COMPLETE_AT = 0.7
// La caméra ne bouge pas tant que la descente n'est pas bien engagée. Sans ce retard, un
// easing démarrant vite l'envoie vers l'entrée du canal alors que celui-ci est encore en
// l'air : elle fonce vers un sol qui n'est pas posé.
export const APPROACH_START_AT = 0.42
// Le regard ne pivote vers l'axe du canal qu'une fois la descente bien avancée : on regarde
// d'abord la spirale de face, puis on s'engage. Pivoter dès le début de l'approche rendait
// le mouvement confus.
export const LOOK_TURN_START_AT = 0.45

export const POINTER_TILT_X = 0.07
export const POINTER_TILT_Y = 0.07
