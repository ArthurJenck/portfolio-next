# Handoff — ambiance sonore générative

Branche `develop`. Modifications **non commitées**. Plan complet : `~/.claude/plans/j-aimerais-mettre-une-ambiance-nifty-possum.md`

## Objectif

Ambiance musicale générative en Web Audio, adaptative à la navigation, avec un bouton mute dont la ligne ondule au rythme du son. Renforce le positionnement « Développeur Créatif ». Ce n'est pas un lecteur de musique : le visiteur ne doit pas la remarquer consciemment.

## Décisions verrouillées

**Registre — « émerveillement inquiet ».** Deux écueils, tous deux rejetés à l'écoute par Arthur :
1. Trop méditation / salon de massage (ambient.garden, Ice Drone, soundescape)
2. Trop sombre / inquiétant (Dark Noise, Stardust, Shepard tone)

Cible : drone intrigant, calme, éthéré. Références : Disasterpeace (*Hyper Light Drifter*, *Fez*), Kali Malone, Biosphere « Uva-Ursi ».

**Variante : Lydien #4.** Gamme fixe `[0, 2, 6, 7, 9, 11]`, jamais de tierce. Drone `[0, 7, 12]`. Fondamentales de modulation `[0, 2, 7, 11]`, **calculées** : seuls les degrés dont le drone transposé reste entièrement dans la gamme. Base Ré (146,83 Hz).

**Pas de Spotify** — Premium requis côté visiteur, pas d'autoplay en iframe, et héberger un MP3 commercial est de la contrefaçon.

**Pas de Tone.js** — le Web Audio brut de la page d'écoute était déjà réglé et validé. Économise 90 ko gzip et une réécriture à risque.

**Piano présent mais minoritaire.** Ne pas sur-corriger vers zéro (erreur déjà commise une fois). 45 % → une note toutes les ~11,5 s.

## Règles apprises à l'oreille — ne pas les casser

| Règle | Ce qui arrive sinon |
|---|---|
| Collection de notes **fixe**, seule la fondamentale du drone module | Fausses notes contre la reverb et les voix en cours |
| Voix suspendues : 3 max, écart ≥ 3 demi-tons, registre 330-554 Hz | Stridences (rugosité de bande critique vers 1 kHz) |
| Souffle : l'intensité passe par le **niveau**, jamais la brillance | Bourrasque sifflante désagréable |
| Fondu de modulation en **puissance constante** (sin/cos) | Deux exponentielles croisées se rejoignent à 0,01 → trou de 40 dB |
| Transitoire du souffle **uniquement sur attaque de geste** | ~14 déclenchements/s en scroll rapide → effet « wagon sur rail » |
| Jamais de tierce (degrés 3 et 4) nulle part | Le registre bascule en majeur ou mineur, l'ambiguïté disparaît |
| Aucune modulation de paramètre instantanée (rampes 2-5 s) | Sauts audibles au scroll rapide |

## Pièges déjà tombés dedans

**Une seule boucle rAF dans le moteur, coupée immédiatement.** `stop()` différait l'annulation de `MIX.fadeOut + 200 ms` alors que `start()` en programmait une nouvelle sans condition : couper puis rallumer en moins de 2 s faisait tourner deux boucles, `this.frame` était écrasé et l'ancienne devenait inannulable. Le fondu de sortie est une rampe planifiée sur l'`AudioParam`, il n'a jamais eu besoin de la boucle.

**`dt` nul interdit dans `tick`.** Deux boucles reçoivent le même `timestamp` → `dt = 0` → `pxAccum / dt` vaut `0/0` → `windEnergy` passe à `NaN` et y reste (les seuils lignes « < 0.001 » et « < 0.004 » sont tous deux faux face à `NaN`), et les deux `setTargetAtTime` du souffle lèvent `non-finite value` à chaque frame. `tick` sort donc tôt si l'intervalle est nul, sans consommer `pxAccum`, et `instant` retombe à 0 sur tout non-fini.

## Latence de sortie

Mesuré : `outputLatency` = **24 ms en filaire, 192-288 ms en Bluetooth**. Le tampon vit dans le firmware du casque, aucune API web ne l'atteint.

- Tout visuel asservi au son **doit être retardé** de `outputLatency` (fait dans `SoundToggle`, via un historique d'amplitude).
- **Piste écartée après test A/B** : adapter la forme du son (effacer le transitoire, allonger l'attaque) pour masquer le retard. Arthur n'entend aucune différence. Ne pas réimplémenter.
- La musique de fond n'est pas concernée (pas d'attaque datable). Les **SFX de micro-interaction de la seconde passe le seront** : un clic à 288 ms est cassé.

## Fichiers

**Créés**
```
src/lib/audio/scales.ts          gamme, racines calculées, PRNG seedé
src/lib/audio/params.ts          tous les réglages, nommés
src/lib/audio/engine.ts          classe AmbientEngine, sans React
src/providers/ambient-audio-context.ts
src/providers/AudioProvider.tsx  import dynamique, persistance, armement
src/hooks/useAudioSignals.ts     navigation → paramètres
src/hooks/useIsCompactNav.ts     breakpoint 1024px du burger
src/components/audio/SoundToggle.tsx
src/components/audio/SoundToggle.scss
src/components/audio/SfxDelegate.tsx   (seconde passe)
```

**Modifiés**
```
src/components/NavBar.tsx        <SoundToggle /> dans les deux <nav>, + useAudioSignals()
src/app/(main)/layout.tsx        <AudioProvider> à l'intérieur de <MotionProvider>
```

**Page d'écoute jetable** (hors projet, sert de référence de réglage) :
`/private/tmp/claude-501/-Users-arthurjenck-Desktop-Code-portfolio/3ef1b498-8182-4388-94cb-37a46ecdfae5/scratchpad/audition.html`

## Contraintes d'architecture

- **`useAudioSignals` ne doit rien importer de `src/lib/audio/`.** Un import statique depuis ce dossier embarquerait le moteur dans le bundle initial et annulerait l'import dynamique. Ça a déjà coûté 5 ko une fois (un ancien `scroll.ts` existait pour cette raison ; il a été supprimé quand le souffle est passé au delta de `scrollY`).
- Le moteur vit dans un chunk de **15 ko chargé au clic uniquement**, non préchargé sur `/`.
- **Le souffle se lit sur `window.scrollY`, pas sur les événements `wheel`.** Le carousel de projets se pilote au `deltaX` de trackpad et au drag pointeur : aucun `deltaY`, mais `window.scrollY` bouge dans les deux cas. Repasser au `wheel` réintroduirait le silence dans le carousel.
- **Autoplay** : le son s'arme au chargement et part au **premier geste réel** (pointerdown / keydown / touchstart), sauf si `sessionStorage.ambient-sound-muted === '1'`. Seul le **refus** est mémorisé, et seulement le temps de l'onglet : une nouvelle visite repart avec l'ambiance armée. Conséquence assumée par Arthur : couper le son puis recharger dans le même onglet ne le relance pas. Un geste né dans le toggle est ignoré par l'armement et laissé à son `onClick`, sinon le `pointerdown` allumerait le son que le `click` éteindrait aussitôt. `onHeroPlay` (dans `src/lib/hero-playback.ts`) se déclenche sans geste utilisateur, il ne peut donc pas lancer le son.
- **`boot()` est verrouillé par une promesse.** Sans ce verrou, deux appels concurrents passent tous les deux le test `engineRef.current` avant que l'import dynamique ne résolve : deux moteurs sont créés, le premier devient orphelin et joue indéfiniment hors de portée de `stop()`, pendant que le visualizer lit l'analyseur du second (symptôme : le trait redevient plat mais le son continue). L'état voulu vit dans `wantedRef` pour qu'un `stop()` arrivé pendant l'import ne soit pas écrasé par le `start()` qui suit.
- L'analyseur est placé **entre** le gain de fondu et le gain de volume : l'onde voit l'enveloppe d'entrée/sortie mais pas le niveau d'écoute.
- Les signaux de navigation ne doivent déclencher **aucun re-render React** — lecture via rAF et écriture directe dans le moteur.
- Bouton en `z-7` (menu burger `z-6`, toggle `z-4`), écart d'au moins 3rem du burger dont la hitbox invisible fait 5rem × 4rem. Celle du `SoundToggle` fait 4rem × 3rem, réduite à 2,5rem sous 1024px pour ne pas mordre sur celle du burger dans la nav mobile (`gap-10`).
- **La barre du toggle est calquée sur les traits du burger** : 48 × 5 px, et 25 × 3 px sous 1024px (`Burger.tsx:32` et `Burger.scss:124-135`). Le `viewBox` vaut exactement les dimensions CSS du SVG, donc 1 unité = 1 px et l'onde ne se déforme pas d'une taille à l'autre. Si les traits du burger changent, `SIZES` dans `SoundToggle.tsx` doit suivre.

## État de vérification

`npx tsc --noEmit` propre · `npx eslint` propre (2 warnings préexistants sur des imports inutilisés dans `ProjectPagerNav`) · `pnpm build` OK.

**Chunk audio isolé et non préchargé**, revérifié après la seconde passe. Le test qui compte :

```bash
CHUNK=$(grep -rl "sawtooth" .next/static/chunks --include="*.js" | grep -v '\.map$' | head -1)
grep -c "$(basename "${CHUNK%.js}")" .next/server/app/index.html   # doit afficher 0

# Aucun chunk contenant data-sfx ne doit contenir sawtooth : sinon un import type
# s'est transformé en import de valeur dans SfxDelegate ou ambient-audio-context.
grep -rl "data-sfx" .next/static/chunks --include="*.js" | grep -v '\.map$' | xargs grep -L "sawtooth"
```

Chunk moteur après la seconde passe : **24,5 ko** (contre ~15,5 ko avant).

**Jamais testé à l'oreille dans le site réel.** Tout le réglage vient des pages d'écoute. À vérifier en priorité : mute pendant une rafale de survol (silence immédiat) · survol après 30 s d'inactivité (tick à plein niveau, preuve que le duck idle est contourné) · scroll jusqu'en bas puis survol (réverbe inchangée, preuve que `depth` ne l'atteint pas) · drag du carousel relâché loin (aucun son) · clic très rapide sur un bouton (press **et** release audibles).

## Points ouverts

1. **Deux mappings jamais validés à l'oreille** : `intimacyFromDepth` (× 0,45, déduit d'un seul point) et le diviseur de vitesse curseur (2,2 px/ms dans `useAudioSignals.ts`).
2. **Retour au drone en inactivité jamais entendu** — comportement absent de la page d'écoute. Après 25 s : voix, piano et partiels descendent à 25 % sur 8 s.
3. **Transposition par section volontairement non implémentée.** La dérive temporelle de 25 s demandée par Arthur occupe déjà cette fonction ; ajouter un déclenchement par section rendrait la dérive imprévisible. À rouvrir seulement si Arthur le demande.
4. ~~Seconde passe non commencée~~ — **faite**, voir ci-dessous.

---

# Seconde passe — SFX de micro-interaction

Six sons courts synthétisés par le même moteur, accordés sur la tonalité courante. Réglés sur une page d'audition jetable (même méthode que la première passe), en quatre itérations d'écoute, puis figés dans `params.ts`. La page a été supprimée après le portage.

## Vocabulaire

| Son | Déclencheur | Matière |
|---|---|---|
| `tick` | survol d'un lien, bouton, pastille | deux sinus (degrés 9 et 2) + un chiff de bruit de 8 ms |
| `tileHover` | survol d'une tuile projet | deux triangles dont le désaccord s'élargit de 4 à 26 cents pendant que le filtre s'ouvre |
| `press` | `pointerdown` sur un bouton | deux sinus à chute de hauteur décalée, **zéro bruit** |
| `release` | `pointerup` sur le même bouton | clic bruité résonant + corps |
| `navInternal` | `click` sur un lien interne | accord `0 + 7 + 12`, hauteur fixe, filtre qui s'ouvre puis se referme |
| `navExternal` | `click` sur un lien externe | idem mais plus long, filtre qui reste ouvert, send de réverbe à 0,72 |
| `like` | `click` sur le bouton like du footer | deux frappes montant d'une quarte, partiels **inharmoniques** 2,76 et 5,42 |

## Trois directions rejetées à l'oreille — ne pas les réintroduire

| Rejeté | Verdict | Retenu |
|---|---|---|
| Glissando / portamento pour la navigation | « du super mario qui saute » | **Aucun portamento nulle part.** Hauteurs fixes, le mouvement passe par le filtre et le panoramique. |
| Balayage de filtre descendant sur la tuile | « trop nintendo Wii » | Filtre qui **s'ouvre** + écartement du détune. C'est le détune qui donne l'enflure, pas le sweep. |
| Press à base de bruit | « j'aime pas du tout l'idée du bruit » | Deux sinus à chute de hauteur. Le release, lui, garde son clic bruité. |
| Combo ascendant sur le like (chaque clic enchaîné montait d'un degré) | « infernal, ça donne envie d'arrêter de cliquer » | **Son identique à chaque clic.** Ne pas réintroduire de progression cumulative. |
| Like en triangle + harmonique d'octave | « pas très beau, il manque le côté ting ou gling » | Partiels **inharmoniques** de barre libre, aux extinctions échelonnées. |

## Le « ting » du like — ce qui le produit

Ce ne sont ni la hauteur ni le filtre, mais deux choses :

1. **Des partiels inharmoniques** — ratios 2,76 et 5,42, les modes d'une barre libre (le `METALLIC` de la première passe utilise déjà 2,76). Des harmoniques entières donneraient une flûte, pas un carillon.
2. **Des extinctions échelonnées** — chaque partiel décroît `partialDecay` fois plus vite que le précédent. L'aigu claque puis s'efface, la fondamentale résonne : c'est cette différence qui s'entend comme une attaque métallique.

Un lowpass serré les détruirait, d'où un plafond propre (`SFX_LIKE.ceiling`, 7000 Hz) au lieu de `SFX_CEILING`. Le registre (`octave: 1`) est choisi pour que **les six composantes restent sous ce plafond sur les quatre racines** — plus haut, le mode 5,42 disparaissait selon la tonalité et le son changeait de caractère. Un partiel trop haut est **omis, jamais rabattu** sur le plafond : le ramener produirait une fréquence arbitraire, donc une fausse note.

Le like est le seul son **exempté de la décroissance en rafale** : le faire faiblir découragerait le clic répété, qui est ce que ce bouton cherche à provoquer.

## Règles apprises — seconde passe

| Règle | Ce qui arrive sinon |
|---|---|
| `varianceCents` réglé **par son** (45 tick, 22 tuile, 50 clics, **5 nav**) | ±45 cents sont inaudibles sur un tick de 75 ms mais battent contre le drone sur un accord tenu → « c'est désaccordé » |
| Les voix de navigation reprennent les degrés du drone (`0, 7, 12`) | Une septième majeure tenue contre l'octave du drone frotte d'un demi-ton |
| `SFX_BUS.level` compense le trim `MIX.master` | Les SFX sortent 7 dB **sous** le drone (−34 dBFS contre −27) et le visiteur monte son volume à fond |
| `guardThreshold` au-dessus du niveau d'un son isolé | Le guard cesse d'être un filet anti-rafale et comprime chaque son de 4,5 dB |
| **Seuls les sons de survol** sont soumis au `minGapMs` global | Un tick parasite rend le clic muet par intermittence. Une animation qui remonte un nœud sous le curseur (`key` qui change) suffit à en produire un : le survol avale alors l'activation, sans cause visible. |
| Le survol se compare à l'**élément mémorisé**, pas à `relatedTarget` | `relatedTarget` ne couvre que le rebond parent/enfant ; après un remontage React il est incohérent et le tick se rejoue alors que la souris n'a pas bougé |
| Un cooldown de **plus de ~40 ms sur un son de clic** | Un clic humain rapide tombe entre 60 et 90 ms : à 110 ms de cooldown, un clic sur deux est rejeté et le bouton paraît cassé par intermittence. Les sons de survol peuvent être plus lents, ils ne répondent pas à une intention. |
| Normaliser un son à partiels multiples par la **somme des poids** | Les partiels s'additionnent : la crête vaut `gain × somme`. Sans normalisation, `gain` ment, le son devient le plus fort du site et enfonce le guard, qui étouffe alors les déclenchements suivants. |
| PRNG `sfxRandom` distinct de `this.random` | La composition générative deviendrait fonction des mouvements de souris du visiteur |

## Architecture

**Bus SFX branché sur `preMix`**, pas sur `bus` ni `eventBus` : `eventBus` est ducké à 0,25 après 25 s d'inactivité (remontée en 8 s), et `bus` alimente `dry`/`wet` dont les gains suivent `depth` — la réverbe d'un tick changerait avec la position de scroll. Sur `preMix`, les SFX héritent du fondu, de l'analyseur (l'onde du `SoundToggle` tressaille à chaque son, avec compensation de latence gratuite) et de l'EQ de sortie.

```
sources -> panner -+-> sfxGuard -> sfxBus -----------------\
                   \-> send local -> sfxVerb -> sfxWet -+-> preMix -> fade -> analyser/master
```

Réverbe **dédiée** (1,6 s) : celle de l'ambiance dure 4,5 s et sa sortie unique passe par `wet`, piloté par `depth`. `createImpulse` est devenu paramétrable plutôt que dupliqué.

**Déclenchement par délégation d'événements** — `SfxDelegate.tsx`, monté dans le JSX de `AudioProvider`, écoute `document` et résout la cible par `closest('[data-sfx]')`. Quatre rôles : `link`, `link-ext`, `button`, `tile`. Choisi contre un hook par composant parce que `ImgLink` rend 6 nœuds DOM pour 4 branches, que `ProjectTile` porte déjà 7 handlers plus 2 listeners GSAP, et que le fond du burger capte les clics des `BurgerLink` par bubbling — avec un `closest`, l'élément marqué le plus profond gagne, donc exactement un son.

**Seule exception** : le clic d'une tuile n'est valide que sous 10 px et 300 ms (`ProjectTile.tsx`), condition inexprimable depuis un délégué. Le rôle `tile` ne déclenche donc aucun son d'activation ; `ProjectTile` appelle `playSfx('navInternal')` lui-même, dans la branche pointeur **et** dans `handleKeyDown`.

## Pièges de la seconde passe

- **`click` et `pointerup` sont écoutés en phase de CAPTURE, et ça n'est pas cosmétique.** En bulle, React a déjà traité l'événement et re-rendu quand il nous parvient. Un composant qui remonte un nœud pendant son handler — une `key` qui change pour rejouer une animation, comme le cœur de `LikeButton` — laisse `event.target` **détaché du document** : `closest()` remonte alors un arbre orphelin et ne trouve jamais `[data-sfx]`, donc aucun son. Symptôme trompeur : cliquer sur le pourtour de l'élément marche, cliquer sur la partie animée ne marche pas. En capture, `document` voit l'événement avant React et l'arbre est intact.
- **`pointerover` rebondit du parent vers l'enfant** : comparer les éléments *résolus* par `closest`, pas les cibles brutes, sinon traverser une icône dans un lien rejoue le tick du lien.
- **Le tactile émet un `pointerover` synthétique** avant le `pointerdown` : sans le filtre `pointerType !== 'mouse'`, chaque tap produirait tick + press + release.
- **Le tout premier clic de la session ne fait aucun son**, et c'est voulu : `engineRef.current` est encore `null` pendant l'import dynamique. Ne pas mettre le son en file d'attente — `fade` vaudrait ~0,02 à l'arrivée, et une file traversant un import dynamique est le motif d'état orphelin qui a déjà coûté un bug ici.
- **`getOutputLatencyMs()` renvoie 0 sur Safari** : la porte Bluetooth (120 ms, qui coupe survol et press/release mais garde la navigation) n'y joue jamais. Non contourné — les fallbacks via `baseLatency` mentent autant.
- **Chronologie navigation/modulation, vérifiée** : le `click` joue le son avec la racine courante *avant* que le `pathname` ne change, donc avant `triggerModulation()`. Les fréquences sont figées à l'émission, le son reste accordé avec ce qu'on entend.
- **`prefers-reduced-motion` ne coupe pas les SFX** (préférence de mouvement, sans pendant audio dans aucun navigateur, et le site a déjà un interrupteur son visible). Seule concession : le pan des sons de navigation est figé via `SfxOptions.still`.

## Fichiers de la seconde passe

**Créé** — `src/components/audio/SfxDelegate.tsx`
**Modifiés** — `engine.ts` (bus SFX, 6 patches, `playSfx`), `params.ts` (types + 9 const), `ambient-audio-context.ts`, `AudioProvider.tsx`, `ProjectTile.tsx`, plus `data-sfx` dans 11 fichiers feuilles
**Intacts** — `scales.ts`, `useAudioSignals.ts`, `SoundToggle.tsx`

Le fond du menu burger ne reçoit **rien** (ni hover ni clic) : fermer en cliquant à côté est un geste d'échappement. `SoundToggle` non plus — un press au moment où l'on coupe le son n'aurait pas de sens, et aucun de ses ancêtres n'étant marqué, `closest` retourne `null`.

## Consignes de travail

- Ne **jamais** lancer `pnpm dev` — Arthur démarre le serveur lui-même. Vérifier avec `tsc --noEmit`, `eslint`, `pnpm build`.
- Pas de commandes git sans demande explicite.
- pnpm, TypeScript strict, pas de commentaires de code sauf demande.
- Prettier : 4 espaces, pas de point-virgule, quotes simples.
- Un seul composant React par fichier.
