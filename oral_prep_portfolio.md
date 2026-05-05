# Oral Gobelins — Préparation arthurjenck.com

> Document généré après audit complet du dépôt (`portfolio-next`, branche `develop`).  
> Chaque affirmation du book technique a été confrontée ligne à ligne au code source.  
> Aucune complaisance : ce document dit ce qui coincerait devant un jury.

---

## 1. Audit book vs code

### Hero & animation typographique

**Affirmation : "au `mousemove`, `e.pageY` injecté comme variable CSS via `style.setProperty('--h1-weight', e.pageY)`"**

⚠️ **Quasi-correct, mais avec deux inexactitudes importantes.**

- La propriété est définie sur `document.querySelector('header')`, **pas** sur `document.documentElement` ni sur `document.body`. C'est scoped à l'élément `<header>`, ce qui est cohérent (la variable n'existe que là où elle est consommée). Mais la formulation "directement sur le DOM" est floue.
- La valeur injectée est `JSON.stringify(e.pageY)`, pas `e.pageY` brut. `JSON.stringify(350)` donne `"350"` — fonctionnellement identique en CSS, mais révélateur que tu n'as pas relu ce détail depuis.

`HeaderSection.tsx:15` :
```ts
document.querySelector('header')!.style.setProperty('--h1-weight', JSON.stringify(e.pageY))
```

---

**Affirmation : "consommée en CSS via `font-variation-settings: 'wght' var(--h1-weight)`"**

✅ Confirmé. `Header.scss:12` :
```scss
font-variation-settings: 'wght' var(--h1-weight, 800);
```

Le fallback est `800`, mais `:root { --h1-weight: 100 }` est défini dans le même fichier SCSS — donc le fallback n'est jamais atteint. La valeur initiale effective est **100** (ultra-thin). En pratique : le `h1` est `opacity: 0` jusqu'à 1.1s après le chargement (0.8s de délai + 0.3s d'animation `appear`). Si l'utilisateur a bougé sa souris pendant ce temps, il ne verra jamais le poids 100. Si la souris n'a pas bougé, le titre apparaît ultra-thin puis change au premier mouvement. C'est un artefact de "cold start" — pas catastrophique, mais non intentionnel.

**Sur mobile** : la media query `max-width: 1024px` overwrite tout avec `font-variation-settings: 'wght' 700`. La valeur `:root` ne joue aucun rôle sur mobile — le poids est hardcodé à 700 quelle que soit la variable.

---

**Affirmation : "police variable importée via `next/font`"**

⚠️ **Partiellement vrai, potentiellement fragile à défendre.**

Sora est bien une variable font (axe `wght` 100–800). Mais dans `layout.tsx`, elle est chargée avec un tableau de poids discrets :
```ts
const sora = Sora({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-sora',
})
```

Selon la documentation Next.js, passer un **tableau** de poids demande à Google Fonts les instances statiques correspondantes, pas le fichier variable. Pour charger le vrai fichier variable, il faut omettre le paramètre `weight` ou passer une range string. Si le jury inspecte les requêtes réseau en live et voit des fichiers séparés par poids, l'affirmation s'effondre. **Si le comportement réel est une interpolation fluide**, c'est que Google sert quand même le variable font — mais c'est à vérifier en DevTools Network sur le site en prod, avant l'oral.

---

**Affirmation : "Pas de `requestAnimationFrame` ou throttling"**

✅ Confirmé — et c'est un choix défendable : l'update d'une CSS custom property est une opération DOM hors du cycle de rendu React. Le navigateur batche naturellement les repaints. Mais le handler `onMouseMove` et `onMouseOver` sont **deux** listeners distincts sur le même élément (`HeaderSection.tsx:22-23`), ce qui peut provoquer un double-trigger à l'entrée.

---

**Affirmation : "Sur un écran 4K, comment la plage 100-900 est gérée ? Clamp ?"**

❌ **Pas de clamp.** Sur un écran 4K (pageY max ≈ 2160), la valeur 2160 est injectée comme font-weight. La spec CSS clampera à 900 (le max de Sora), donc visuellement ça ne casse pas — mais c'est subi, pas contrôlé. La réponse honnête : "le navigateur gère le clamping implicitement via les contraintes de l'axe variable, mais je n'ai pas ajouté de `Math.min(900, Math.max(100, e.pageY))` explicite."

---

**Affirmation : "Mobile : effet désactivé, weight fixé à 700"**

✅ Confirmé. `Header.scss:38-42` :
```scss
@media screen and (max-width: 1024px) {
    h1 { font-variation-settings: 'wght' 700; }
}
```
Le breakpoint est **1024px** (Tailwind `lg:`), pas seulement "mobile" — ça couvre aussi les tablettes en portrait.

---

**Affirmation : "`prefers-reduced-motion` : respecté ?"**

✅ **Implémenté en trois couches** (ajouté entre l'audit initial et l'oral) :

1. **CSS global** (`globals.css:42-56`) : `@media (prefers-reduced-motion: reduce)` qui force `scroll-behavior: auto`, `animation-duration: 0.01ms`, `transition-duration: 0.01ms`, et neutralise les delays/iterations sur tous les éléments. Filet de sécurité global qui couvre toutes les animations CSS.
2. **Framer Motion** (`MotionProvider.tsx`) : `<MotionConfig reducedMotion="user">` enveloppe l'app entière depuis `layout.tsx:139`. Framer Motion respecte automatiquement la préférence système — les springs, les `useTransform` scroll-driven, et toutes les animations Framer dégradent vers des transitions instantanées ou neutralisées.
3. **Hook React** (`usePrefersReducedMotion.ts`) : 24 lignes, lit la media query via `window.matchMedia` et écoute les changements en runtime via `addEventListener('change')`. Consommé à trois endroits :
   - `useScroll.ts` → désactive le smooth scroll programmatique
   - `NavBar.tsx:14, 29` → désactive le spring sur l'opacité du logo
   - `ProjectTile.tsx:29, 56, 180` → court-circuite l'animation anime.js en deux phases sur le hover

**Limites honnêtes à connaître** :

- **HeaderSection** continue d'écouter `mousemove` et de muter `--h1-weight` à chaque event, sans gating. Mais comme il n'y a pas de transition CSS sur `font-variation-settings`, et que le bloc CSS global force `transition-duration: 0.01ms`, l'effet visuel est neutralisé côté CSS. Le handler tourne, mais le rendu n'anime plus.
- **ProjectsCarousel** n'utilise pas le hook directement, mais le `MotionConfig reducedMotion="user"` couvre tous ses motion.div et useTransform. Le scroll-jacking sticky 600vh reste structurel (la section continue d'occuper 600vh même en reduced motion) — c'est une limitation honnête à mentionner si le jury creuse.

**Position défendable en oral** : *"J'ai implémenté `prefers-reduced-motion` en trois couches : un filet CSS global qui neutralise toutes les animations, un MotionProvider Framer Motion qui propage la préférence à toute l'arbre, et un hook React consommé là où je veux un comportement conditionnel précis (NavBar, ProjectTile, useScroll). Ce que je n'ai pas encore fait : court-circuiter le sticky 600vh du carousel, qui reste structurel — c'est ma prochaine itération."*

---

**Affirmation : "font-display, FOIT/FOUT"**

✅ `display: 'swap'` confirmé pour Sora et Montserrat. FOIT évité. FOUT possible (flash au swap) mais acceptable.

---

### Carousel de projets

**Affirmation : "conteneur sticky de 600vh"**

✅ Confirmé. `ProjectsSection.tsx:13` :
```tsx
<section id="projets" className="relative h-full md:h-[600vh]">
```

Le sticky est confirmé : `sticky top-0 md:h-screen md:overflow-hidden`.

---

**Affirmation : "`scrollYProgress` → `translateX` via `useTransform`"**

✅ Confirmé. `ProjectsCarousel.tsx:72-83`. `scrollYProgress` passe de 0 à 1, mappé à `[0, dragBounds.left]` (valeur négative = translation vers la gauche).

---

**Affirmation : "hook custom `useCarouselDrag` pour drag manuel, pas de drag natif Framer Motion"**

✅ Confirmé. Le composant utilise `onPointerDown/Move/Up` custom. Aucun attribut `drag` de Framer Motion sur le conteneur.

---

**Affirmation : "multiplicateur ×2 sur le drag"**

✅ Confirmé. `config.ts:48` : `DRAG_MULTIPLIER = 2`.

---

**Affirmation : "inertie via spring si vélocité > 0.1"**

⚠️ **Approximation.** La vélocité est bien comparée à `MIN_VELOCITY_FOR_INERTIA = 0.1` (`useCarouselDrag.ts:99`). Mais l'inertie n'est **pas** un vrai spring continu : c'est une **projection linéaire** de la position finale (`targetX = currentX + velocity * 300 * 0.8`), puis un spring de transition vers ce point fixe. Une vraie inertie spring mettrait à jour sa cible en continu. La distinction est subtile mais réelle si le jury connaît Framer Motion en profondeur.

---

**Affirmation : "au drag : container scale à 0.9, perspective CSS 1000px"**

✅ Confirmé.
- `DRAG_SCALE = 0.9`, appliqué avec `animate={{ scale: isDragging ? DRAG_SCALE : 1 }}` (`ProjectsCarousel.tsx:235`).
- `perspective: '1000px'` sur le `viewportRef` (`ProjectsCarousel.tsx:232`).

---

**Affirmation : "inversion du scale sur les titres (1/0.9) — référence au traveling compensé / effet Vertigo"**

✅ **Confirmé — mais à un niveau d'imbrication plus profond que prévu. Savoir l'expliquer précisément.**

Le contre-scale n'est **pas** sur le `motion.div` extérieur du conteneur de titres (qui scale bien à 0.9 comme le conteneur d'images). Il est appliqué à l'intérieur, dans chaque `ProjectDescription.tsx:32-39` :

```tsx
const inverseScale = isDragging ? 1 / DRAG_SCALE : 1  // ≈ 1.111

<motion.div
    animate={{ scale: inverseScale }}
    transition={TITLE_SCALE_TRANSITION}
    style={{ transformOrigin: 'left top' }}
>
```

Résultat : le conteneur de titres scale à 0.9, et chaque carte de description contre-scale à `1/0.9 ≈ 1.111`. Le texte résiste visuellement au zoom-out, ce qui crée bien la tension du traveling compensé. Le `transformOrigin: 'left top'` ancre le contre-scale au coin supérieur gauche de chaque titre, ce qui renforce l'effet de "solidité" du texte pendant que la scène recule.

**Point de précision à maîtriser** : si le jury demande "montre-moi le contre-scale dans le code", il faut ouvrir `ProjectDescription.tsx`, pas `ProjectsCarousel.tsx`. Le fait que ce soit dans le composant enfant plutôt que sur le wrapper extérieur est un choix architectural : chaque description gère sa propre compensation, ce qui est plus composable qu'un scale global inversé.

---

**Affirmation : "images (stiffness 400, mass 0.3), titres (stiffness 250, mass 1.5)"**

✅ Confirmé exactement. `config.ts:14-26`.

---

**Affirmation : "trackpad intercepté et converti"**

✅ Confirmé. `ProjectsCarousel.tsx:198-211` : le wheel handler détecte `Math.abs(e.deltaX) > 0` et re-route vers `window.scrollBy({ top: e.deltaX })`. Nuance : si le trackpad envoie simultanément deltaX et deltaY (scroll diagonal), le `preventDefault()` supprime les deux axes, ce qui peut bloquer momentanément le scroll vertical.

---

**Affirmation : "`passive: false` sur le wheel"**

✅ Confirmé. `ProjectsCarousel.tsx:213` :
```ts
section.addEventListener('wheel', handleWheel, { passive: false })
```
Cela permet le `preventDefault()` mais empêche le navigateur d'optimiser le scroll via le thread compositing. Impact sur les perfs mesurable mais acceptable pour ce cas.

---

### Tiles 3D au hover

**Affirmation : "Image + 4 cartes empilées, opacité décroissante (0.8 → 0.2)"**

⚠️ **Ordre inversé.** Le code JSX empile de bas en haut : `opacity-20`, `opacity-40`, `opacity-60`, `opacity-80`, puis l'image (opacity implicitement 1). L'opacité est donc **croissante** (0.2 → 0.8 → 1), les cartes les plus sombres sont en dessous. Le sens "décroissant" du book est la perspective du viewer (de haut en bas), pas l'ordre du DOM. Clarifier si la question est posée.

---

**Affirmation : "animation en deux phases : soulèvement 200ms ease-in, puis déplacement 700ms ease-out élastique en cubicBezier"**

✅ Confirmé. `ProjectTile.tsx:63-93` :
- Phase 1 : `duration: 200`, `easing: 'cubicBezier(0.42, 0, 1, 1)'` (ease-in pur — accélère)
- Phase 2 : `duration: 700`, `easing: 'cubicBezier(0.2, 1, 0.3, 1)'` (ease-out sur-amorti — décélère avec overshoot)

Le mot "élastique" est une approximation poétique : `cubicBezier(0.2, 1, 0.3, 1)` dépasse légèrement 1.0 en Y (overshoot), ce qui crée un effet légèrement élastique mais pas un vrai spring. C'est défendable.

---

**Affirmation : "`translateZ` dépend de l'index (éventail en profondeur)"**

✅ Confirmé. Phase 1 : `index * 8 + 8`. Phase 2 : `index * 20 + 20`. Les items d'index 0 à 4 vont de 8px à 40px (phase 1) et de 20px à 100px (phase 2).

---

**Affirmation : "image scale à 0.7 dans son conteneur fixe"**

✅ Confirmé. `ProjectTile.tsx:99` : `scale: 0.7`, duration 900ms.

---

**Affirmation : "`will-change` ?"**

⚠️ `will-change: 'transform'` est présent sur les deux flex containers du carousel (`ProjectsCarousel.tsx:243, 293`). Il est **absent** des stack items dans `ProjectTile`. Pour un hover animation sur plusieurs éléments, c'est une optimisation manquante potentiellement notable sur des machines moins puissantes.

---

### Stack & dépendances

**Affirmation : "Tailwind a remplacé ~70% du SCSS"**

✅ Défendable. Les fichiers SCSS restants (`Header.scss`, `Burger.scss`, `Contact.scss`, `FastTravel.scss`) contiennent principalement : des keyframes CSS complexes, des pseudo-éléments avec positionnement absolu calculé, et des animations de typing-cursor. Ces cas ne se mappent pas proprement en Tailwind utilities, même en v4.

**Nuance à préparer** : ce n'est pas que Tailwind "ne peut pas" — c'est que les keyframes custom et les pseudo-sélecteurs imbriqués sont plus lisibles en SCSS. La distinction est de lisibilité, pas de capacité.

---

**Affirmation : "Framer Motion + anime.js — deux libs d'animation"**

✅ Confirmé. Framer Motion gère le carousel (springs, scroll). Anime.js gère les tiles au hover (timeline séquentielle, cubicBezier précis). La justification est cohérente : Framer Motion expose mal les timelines multi-phases avec des easings différents par phase. Anime.js est plus expressif pour ça. **Mais le coût bundle est réel** : Framer Motion (≈40kb gzip) + anime.js (≈6kb gzip) = surface non négligeable.

---

**Affirmation : "Pas de WebGL, pas de GSAP"**

✅ Confirmé. Aucun import THREE, canvas WebGL ou GSAP dans le src.

---

**Données non mentionnées dans le book mais présentes dans le code (potentiels points de surprise) :**

- **TanStack Query** (React Query v5) : gestion du server state côté client pour tous les fetches (projets, skills, CV, contact). Non mentionné.
- **react-admin** : back-office complet à `/admin` avec auth Next-Auth + MongoDB. C'est une feature CMS complète. Ambigu si mentionné en oral — peut valoriser ou signaler une sur-ingénierie.
- **Embla Carousel** : utilisé dans les pages projet pour le carousel de médias. Troisième lib d'interface.
- **Vercel Analytics + Speed Insights** : intégrés et actifs.
- **zustand** : listé en dépendances, non visible dans les composants principaux lus.
- **dnd-kit** : drag-and-drop pour l'admin (réordonner skills, projets, links). Non pertinent pour l'oral.

---

## 2. Questions probables du jury

### A. Hero & font variation

- **[Probable]** Pourquoi `setProperty` sur le DOM plutôt que `useState` + style inline ? L'argument "éviter les re-renders" tient-il vraiment — React 19 batche aggressivement, et un re-render sur un seul composant `<header>` à 60fps serait-il vraiment perceptible ?
- **[Probable]** `onMouseMove` et `onMouseOver` sont tous les deux attachés — double-trigger garanti à l'entrée dans le header. Pourquoi ?
- **[Probable]** Sur un écran 4K, `e.pageY` peut dépasser 2000. Comment la plage 100-900 est-elle gérée ? Y a-t-il un clamp explicite quelque part ?
- **[Probable]** La valeur initiale de `--h1-weight` est 100 (ultra-thin) avant tout mouvement de souris. Est-ce intentionnel visuellement ?
- **[Plausible]** Sora est chargé avec un tableau de poids discrets dans `next/font` — est-ce vraiment le fichier variable qui est servi, ou des instances statiques ? Quel impact sur l'interpolation ?
- **[Plausible]** Pourquoi pas `CSS Houdini @property` pour typer la custom property et bénéficier d'une interpolation CSS native ?
- **[Plausible]** `prefers-reduced-motion` : le h1 anime en permanence au mouvement de souris. Quel fallback pour les utilisateurs qui ont déclaré préférer moins d'animation ?
- **[Piège]** "Tu dis que `document.querySelector('header')` est utilisé — pourquoi pas un `useRef` ? Chaque mouvement de souris force une recherche DOM."

### B. Carousel & scroll-jacking

- **[Probable]** 600vh de scroll-jacking pour naviguer dans le carousel. Face à un jury qui cite les WCAG 2.4.3 (focus order) et 2.1.1 (keyboard) — quelle est ta justification ? La créativité suffit-elle ?
- **[Probable]** `prefers-reduced-motion` : absent de tout le codebase. Un utilisateur qui a coché "réduire les animations" dans ses réglages OS aura le carousel animé à pleine vitesse, les tiles en 3D, l'hero en variation continue. Comment tu réponds ?
- **[Probable]** Navigation clavier : un utilisateur Tab-only peut-il atteindre les projets dans le carousel ? `ProjectTile` n'a ni `tabIndex` ni `onKeyDown`.
- **[Probable]** Tu peux expliquer la physique d'un oscillateur harmonique amorti ? Pourquoi mass = 1.5 sur les titres vs 0.3 sur les images produit exactement l'effet de traîne que tu décris ?
- **[Plausible]** La "traîne des titres" : les titres ont stiffness 250/mass 1.5 — soit une fréquence naturelle plus basse. C'est défendable. Mais est-ce que ça se voit à l'œil nu, ou est-ce un effet imperceptible en pratique ?
- **[Plausible]** Tu affirmes "inversion du scale sur les titres (1/0.9) — référence au traveling compensé". Le code applique exactement le même scale 0.9 aux images et aux titres. Il n'y a aucun contre-scale. Comment tu réponds ?
- **[Plausible]** Le drag custom : pourquoi pas `drag="x"` de Framer Motion avec `dragConstraints` ? "Contrôle total" est une vraie raison ou une rationalisation a posteriori ?
- **[Plausible]** `{ passive: false }` sur le wheel handler : quel impact sur le thread de composition du navigateur ? As-tu mesuré l'impact avec le Rendering panel de DevTools ?
- **[Piège]** "Montre-moi un projet précis dans le carousel en moins de 10 secondes." (Test de l'utilisabilité réelle du scroll-jacking en situation de démo.)
- **[Piège]** Conflit scroll diagonal sur trackpad : `preventDefault()` sur le wheel event supprime le deltaY même quand l'utilisateur veut scroller verticalement. As-tu un seuil pour distinguer scroll horizontal intentionnel vs accidentel ?

### C. Tiles 3D

- **[Probable]** `will-change` est absent des stack items dans `ProjectTile` — avec 10 projets affichés et 5 divs animées par tile, soit 50 éléments, as-tu mesuré l'impact sur le frame budget à l'hover ?
- **[Probable]** L'image dans le tile a `alt="Image"` — ce n'est pas un alt text, c'est un placeholder. Comment un lecteur d'écran interprète ça ?
- **[Plausible]** Pourquoi anime.js ici et Framer Motion ailleurs ? La frontière est-elle claire dans ton système d'animation ?
- **[Plausible]** Tu peux lire `cubicBezier(0.2, 1, 0.3, 1)` à l'œil et décrire son énergie ? Quel outil as-tu utilisé pour trouver ces valeurs ?
- **[Plausible]** La référence "stacking cards" / tiles 3D : d'où vient cette inspiration précisément ? Est-ce qu'il y a une référence de design ou de UI kit connue ?
- **[Piège]** "Montre-moi l'effet tile en live sur mobile." (Touch n'envoie pas de `mouseenter` — les tiles ne s'animent pas au touch. Le hover effect est desktop-only, silencieusement.)

### D. Stack & choix techniques

- **[Probable]** Next.js pour un portfolio statique à contenu personnel : l'argument SEO est-il vraiment chiffré ? Lighthouse SEO score avant/après, mots-clés rankés, Search Console ? Sans données, c'est une affirmation creuse.
- **[Probable]** Tailwind a remplacé 70% du SCSS — pourquoi pas 100% ? Les keyframes et pseudo-éléments restant pourraient-ils passer en Tailwind v4 avec `@keyframes` inline ou les classes `animate-*` ?
- **[Plausible]** Framer Motion v12 + anime.js 3.x : deux libs d'animation, mais surtout deux APIs, deux paradigmes (declarative vs imperative). Est-ce intentionnel ou historique ?
- **[Plausible]** react-admin, TanStack Query, Mongoose, NextAuth — le portfolio expose une surface back-end non négligeable. Est-ce de la sur-ingénierie pour un portfolio personnel, ou un choix pédagogique pour se prouver quelque chose ?
- **[Piège]** "Tu as zustand dans tes dépendances — où est-il utilisé ?"

### E. SEO V1 vs V2

- **[Probable]** Lighthouse SEO score concret sur la V1 (SPA React) vs V2 (Next.js) ? Sans screenshot ou chiffre, tu affirmes sans prouver.
- **[Probable]** JSON-LD chargé avec `strategy="afterInteractive"` — Google peut indexer le schéma après hydration, mais c'est sous-optimal. Pourquoi pas `beforeInteractive` ou dans le `<head>` statique ?
- **[Plausible]** Les images de projets viennent de Vercel Blob Storage — format AVIF/WebP servi automatiquement via Next Image ? Quelle est la politique de cache ?
- **[Plausible]** L'`alt` des images dans `ProjectTile` est `"Image"` — non descriptif pour le SEO d'image aussi bien que pour l'a11y.

### F. Accessibilité

- **[Probable] — désormais à RETOURNER en argument positif** `prefers-reduced-motion` : implémenté en trois couches (CSS global, MotionProvider Framer, hook consommé dans NavBar/ProjectTile/useScroll). À devancer spontanément lors de la présentation du carousel ou des tiles : *"J'ai aussi mis en place `prefers-reduced-motion` qui désactive ou dégrade les animations pour les utilisateurs qui en font la demande système."* Limite à connaître : le sticky 600vh du carousel reste structurel — pas encore court-circuité.
- **[Probable]** L'hero : texte blanc sur vidéo de fond avec `brightness-30`. As-tu vérifié le ratio de contraste WCAG AA (4.5:1 pour le texte normal, 3:1 pour le gros texte) ? La vidéo varie — certaines frames peuvent être très claires.
- **[Probable]** Le carousel scroll-jacking sans ARIA region, sans `role="region"`, sans annonce aux lecteurs d'écran. VoiceOver sur Mac : qu'entend l'utilisateur en naviguant dans cette section ?
- **[Plausible]** Pas de skip links — un utilisateur clavier doit Tabber à travers le NavBar et l'hero avant d'atteindre le contenu.
- **[Plausible]** Le focus visible : style de focus navigateur natif ou custom ? Sur fond sombre, le outline par défaut peut être peu visible.
- **[Piège]** "Lance axe DevTools ou l'extension WAVE sur ton site en live. Combien d'erreurs ?"

### G. Cohérence avec ce que tu vends

- **[Probable]** En oral, tu dois pointer un projet précis dans le carousel rapidement. Comment tu fais sans perdre le jury ? (Le FastTravel dots permet de sauter à la section, pas à un projet précis.)
- **[Probable]** L'effet tile hover est invisible sur mobile (pas de mouseenter au touch). Sur un téléphone tenu en main par un jury, le carousel est remplacé par une liste mobile, et les tiles n'ont pas d'effet. Est-ce clairement assumé ?
- **[Plausible]** Le carousel n'a pas d'état "sélectionné" — si le jury demande "montre-moi ton projet le plus récent", as-tu un moyen de naviguer sans frotter 600vh de scroll ?

### H. Définition du design interactif

- **[Probable]** Quelle est ta définition personnelle du design interactif ? (Explicitement demandée par le règlement Gobelins.)
- **[Probable]** Références "classiques" : au-delà des contemporains web, quel designer ou penseur interactif des années 80-2000 te revendiques-tu ? (Bret Victor, John Maeda, Casey Reas, Joshua Davis, Muriel Cooper ?)
- **[Probable]** Références singulières récentes : au-delà de Bruno Simon et Merci-Michel, qu'est-ce que tu suis activement aujourd'hui ? (Awwwards SOTD quotidien ? Quelques studios spécifiques ? Quelque chose d'inattendu ?)
- **[Plausible]** ThreeJS Journey "depuis février 2026" — qu'est-ce qui est **public et démontrable** aujourd'hui ? Un CodePen, une scène, un repo ? Sans livrable public, l'affirmation est de l'ordre du "j'ai lu le livre mais je n'ai rien construit".
- **[Plausible]** Le hackathon VivaLeHack juin 2025 : GPT-5 n'existait pas en juin 2025 (GPT-4o était le modèle en production). Ce détail peut interroger sur la précision des affirmations.

### I. Anglais (questions probables en anglais)

1. "How would you describe the interaction design philosophy behind your portfolio's project carousel?"
2. "You mentioned scroll-jacking as a deliberate creative choice — how do you reconcile that with modern accessibility standards?"
3. "If you had to explain variable fonts and `font-variation-settings` to a designer with no coding background, what would you say?"
4. "What does 'interactive design' mean to you, and who are your references beyond the web — think broader, think historically?"
5. "Your portfolio has no WebGL — given that you're applying for a Lead Tech creative program, how do you position yourself compared to candidates who ship Three.js projects?"
6. "Describe a technical problem on this portfolio that you solved in an unexpected way."
7. "If you were starting this portfolio from scratch tomorrow, what would you do completely differently, and why?"
8. "How do you approach the tension between creative experimentation and production-quality code in a professional context?"

### J. Recul

- **[Probable]** "Si tu refaisais ce portfolio aujourd'hui, qu'est-ce que tu changerais en priorité ?"
- **[Probable]** "Quelle est la limite principale de cette V2 ?"
- **[Probable]** "Quand prévois-tu une V3, et qu'est-ce qu'elle apporterait ?"
- **[Plausible]** "Ce portfolio montre principalement du front-end React — où est le créatif, le geste artistique, l'expérimentation formelle ?"

### K. Pièges live à anticiper

- **[Piège sévère]** Le claim "traveling compensé / Vertigo" sur les titres : le code ne l'implémente pas. Si quelqu'un regarde le DevTools, la propriété `scale` des deux containers est identique.
- **[Piège sévère]** Tiles hover sur mobile en live : aucun effet. Si la démo est faite depuis un téléphone partagé en screen share, les tiles sont plats.
- **[Piège modéré]** `document.querySelector('header')` non mis en cache → performance question facile.
- **[Piège modéré]** `alt="Image"` sur toutes les images de projet → échec WCAG automatisé.
- **[Piège modéré]** zustand dans le package.json — impossible à expliquer si jamais tu ne sais plus pourquoi il est là.
- **[Piège léger]** Lighthouse sur le site en live — le carousel sticky + 600vh + les springs peuvent dégrader le CLS et le TBT.

---

## 3. Faiblesses structurelles

### 1. ~~Absence totale de~~ `prefers-reduced-motion` — implémenté

**Statut V2.1 (post-prep)** : implémenté en trois couches. Cette ancienne faiblesse est devenue un argument à mettre en avant.

**Architecture** :
1. **CSS global** dans `globals.css:42-56` — neutralise toutes les animations/transitions/smooth-scroll si la préférence système est activée.
2. **`MotionProvider`** (`providers/MotionProvider.tsx`) — wrap l'app avec `<MotionConfig reducedMotion="user">`, donc Framer Motion (springs, useTransform, motion.div) respecte automatiquement la préférence sans code conditionnel par composant.
3. **Hook `usePrefersReducedMotion`** (24 lignes, écoute la media query en runtime via `addEventListener('change')`), consommé dans `NavBar.tsx`, `ProjectTile.tsx`, et `useScroll.ts` pour les comportements qui méritent un gating React-level.

**Ce qui n'est PAS encore couvert (à connaître pour ne pas survendre)** :
- Le mousemove handler du `HeaderSection` continue de tourner — mais l'effet visuel est neutralisé par le bloc CSS global qui force `transition-duration: 0.01ms`. Le handler s'exécute, le repaint reste instantané.
- Le sticky 600vh du carousel reste structurel — la section occupe toujours 600vh de scroll même en reduced motion. C'est une dette identifiée pour la prochaine itération.

**À faire pour parfaire avant l'oral (10 minutes de code)** :
- Gater le `handleH1Wght` dans `HeaderSection` derrière le hook (no-op si reduced motion) pour éviter l'exécution inutile du listener.
- Optionnel : court-circuiter le `h-[600vh]` du `ProjectsSection` quand reduced motion est actif — passer en grille verticale ou liste classique.

**Position en oral** : *"J'ai implémenté `prefers-reduced-motion` en trois couches — CSS global, MotionProvider Framer Motion, et hook React consommé là où j'ai besoin de logique conditionnelle. Ce qui n'est pas encore couvert : le sticky 600vh du carousel reste structurel, et le mousemove du hero continue de tourner sans effet visuel grâce au filet CSS global. Ce sont les prochaines étapes."*

---

### 2. Accessibilité clavier du carousel : zéro

---

### 3. Accessibilité du carousel : zéro

**Description** : Le carousel principal n'est ni navigable au clavier ni annoncé aux technologies d'assistance. Les `ProjectTile` n'ont pas de `tabIndex`, pas de `role="button"`, pas de `aria-label` sur le projet. Le scroll-jacking sur 600vh est non annoncé.

**Pourquoi ça pose problème** : Le scroll-jacking est l'un des points les plus discutés en design interactif. Les Gobelins forment des Lead Techs qui doivent pouvoir défendre ou mitiger leurs choix. L'absence totale de fallback rend la position indéfendable sur ce critère.

**Réponse honnête** : "Sur mobile, j'ai une alternative complète : la MobileProjectsList remplace le carousel par une liste verticale accessible. Sur desktop, le carousel est le point de friction. Un fallback minimal serait d'ajouter `role="region" aria-label="Projets"` sur la section, `tabIndex={0}` et `onKeyDown` (flèches) sur les tiles. Ce n'est pas implémenté en V2 — c'est un déficit réel."

---

### 4. La font animation repose sur une mécanique fragile

**Description** : Pas de clamp sur pageY, valeur initiale à 100 (ultra-thin) potentiellement jarring, double listener mousemove + mouseover, `document.querySelector` non mis en cache à chaque event. L'ensemble fonctionne — mais c'est du code de prototype que la production aurait durci.

**Pourquoi ça pose problème** : Sur un écran ultra-wide ou 4K, l'animation devient monolithique au-delà de 800px Y. Sur une machine lente, le double listener peut causer des sauts de poids perceptibles.

**Réponse honnête** : "J'aurais dû cacher la référence `header` dans un `useRef`, ajouter un `Math.min(900, Math.max(100, e.pageY))`, et supprimer le `onMouseOver` redondant. Ce sont des raffinements que j'aurais faits en passant ce composant en code review."

---

### 5. L'absence de WebGL public crée un angle mort pour un Lead Tech créatif

**Description** : Le portfolio affiche de bonnes animations CSS/JS mais aucun livrable public en Three.js ou WebGL. Le book mentionne "ThreeJS Journey depuis février 2026" et un "projet HETIC en cours" — mais rien de public.

**Pourquoi ça pose problème** : Les Gobelins forment des Lead Techs qui pilotent des projets à "forte composante créative et 3D". Un jury verra des portfolios avec des scènes Three.js en prod. L'absence de tout livrable WebGL, même expérimental, peut positionner le profil comme "compétent front-end, pas encore créatif 3D".

**Réponse honnête** : "Je suis en apprentissage structuré (ThreeJS Journey) depuis février 2026. Le choix de ne pas publier un Three.js bancal est délibéré : je préfère maîtriser les fondamentaux avant d'exposer. Le projet flipper HETIC (React Three Fiber + Rapier + IoT) est le premier livrable que je vise, et il devrait être déployable d'ici [date]. Cette candidature est précisément pour accélérer cette montée en compétence dans un cadre exigeant."

---

## 4. Démo live suggérée (2-3 min)

### Parcours recommandé

**0:00 — Hero (20 sec)**
- Entrer sur le site, laisser l'animation d'apparition se dérouler.
- Bouger lentement la souris de haut en bas en commentant l'animation du font-weight et la variable CSS.
- Ne pas faire de mouvements erratiques (le poids à 100 initial peut jarrer si la souris est en haut de l'écran).

**0:20 — Skills (20 sec)**
- Scroll vers la section Skills pour montrer la structure sticky des catégories.
- Mentionner TanStack Query si quelqu'un demande d'où viennent les données.

**0:40 — Carousel (60-70 sec)**
- Scroll progressivement jusqu'à la section Projets — laisser le sticky se stabiliser.
- Montrer le drag horizontal en commentant le spring différencié images/titres.
- Montrer le scale 0.9 au drag.
- **NE PAS** parler du traveling compensé spontanément — attendre si la question vient.
- Hover sur une tile pour montrer l'animation 3D anime.js — idéalement la tile la plus visible.
- **Préparer à l'avance** de savoir quelle position de scroll correspond à quel projet pour naviguer vite.

**1:50 — About (15 sec)**
- Montrer le portrait ASCII (point de personnalité, facile à commenter).

**2:05 — Contact (15 sec)**
- Montrer la section contact avec les liens et le CopyBtn.

**2:20 — Fermer**

### Ce qu'il ne faut pas montrer spontanément

- **Tiles en hover depuis un mobile** : l'effet est absent (mouseenter ne déclenche pas sur touch).
- **La console DevTools** sans l'avoir nettoyée avant — vérifier qu'il n'y a pas de warnings/errors.
- **Un zoom à 90% ou plus** : le `text-[clamp(10px,3.5vw,1rem)]` du sous-titre hero peut devenir illisible à petite résolution.
- **Le scroll wheel horizontal à grande vitesse** : le `preventDefault` sur le deltaX peut produire des sauts si le trackpad envoie des events rapides.
- **L'admin panel** : ne pas naviguer vers /admin même accidentellement.

### Navigation rapide vers un projet précis

Pour pointer un projet précis pendant l'oral sans frotter 600vh : utiliser le burger menu ou les FastTravel dots pour sauter à la section, puis draguer horizontalement. Il n'y a pas de "jump to project N" — anticipe cette limitation avec une phrase : "Le carousel est conçu pour une navigation exploratoire. Si je devais intégrer une navigation directe, j'ajouterais des bullets de positionnement dans la section description."

---

## 5. Zones du code à relire avant l'oral

| Fichier | Ligne | Pourquoi |
|---|---|---|
| `src/components/header/HeaderSection.tsx` | 14-16 | Mémoriser exactement la formulation : `document.querySelector('header')`, `JSON.stringify(e.pageY)` |
| `src/components/header/Header.scss` | 4-12 | Valeur initiale 100, fallback 800, breakpoint 1024px |
| `src/components/projects/config.ts` | Tout | Toutes les constantes numériques (600vh dans Section, DRAG_SCALE, springs, ITEM_WIDTH, DRAG_MULTIPLIER) |
| `src/components/projects/ProjectsCarousel.tsx` | 227-285 | La structure des deux motion.div — confirmer qu'il n'y a pas de contre-scale sur les titres |
| `src/components/projects/ProjectsCarousel.tsx` | 194-218 | Le wheel handler et `{ passive: false }` |
| `src/hooks/useCarouselDrag.ts` | 89-131 | La logique d'inertie — projection linéaire + spring vers target fixe |
| `src/components/projects/ProjectTile.tsx` | 52-101 | Les deux phases anime.js, les cubicBezier, les opacités |
| `src/app/(main)/layout.tsx` | 13-25 | Sora et Montserrat — poids array vs variable, display swap |

---

## 6. Handoff prep — état au 2026-04-29 (à lire avant de reprendre)

### Ce qui a été drillé en simulation (16 questions au total)

**Couvert :**
- Définition personnelle du design interactif
- Hero font animation : intention + mécanique technique (geste → pixel)
- Variable fonts (perspective DA + perspective dev)
- Carousel scroll-jacking : justification d'intention + alternatives navigation
- Accessibilité : Tab navigation, `prefers-reduced-motion` (désormais implémenté)
- Trois.js / WebGL : 4 projets concrets (Galaxy, Haunted, HETIC TP avec imposters, flipper R3F)
- Optimisations 3D : LOD, instancedMesh, cross-billboards (≠ vrais imposters au sens strict)
- Références non-web (Aronofsky → trois ponts concrets vers le portfolio)
- Vision V3 : cohérence DA cross-canal, light mode

**Pas encore drillé :**
- Présentation libre / introduction (à préparer à froid)
- Stack & choix techniques détaillés (Tailwind v4 vs SCSS, react-admin/CMS, zustand, deux libs d'animation)
- SEO V1 vs V2 (Lighthouse, JSON-LD, Vercel Blob)
- Anglais — **angle "créatif + entrepreneurial", pas tech** (les modalités précisent : *"sujets plus créatifs ou liés à l'entrepreneuriat, ouverture d'esprit à l'international (langue et culture) et culture créative"*)
- Démo live anticipée (parcours 2-3 min)
- Questions identitaires ("plus dev ou plus designer ?")

### Forces installées — à capitaliser

- **Honnêteté sous pression** : reconnaît ne pas savoir > invente. Posture mature.
- **Récupère bien après recadrage** : accepte la critique, reformule, n'argumente pas pour l'argument.
- **Vraie culture mobilisable** : Aronofsky (Requiem précis, scènes nommées), Climate Crisis, Recursive, Alan Resnick (This House Has People In It), BotW pour le sound design.
- **Capacité à lier référence + pratique** : le pont Aronofsky → renard low poly + positional audio est mémorable.
- **Pensée perf authentique** : DOM-bypass pour le hero, instancedMesh + cross-billboards pour la forêt 3D, mesures avec stats.js.
- **`prefers-reduced-motion` désormais implémenté** : à devancer activement comme argument positif (cf. section 1).

### Faiblesses récurrentes — à corriger AVANT l'oral

1. **Mythe `will-change`** : mentionne deux jours de suite un `will-change` sur le hero qui n'existe pas dans le code. **Vérifier en ouvrant `Header.scss` et `HeaderSection.tsx` qu'il est absent, puis biffer mentalement de tous les récits sur le hero.** Le DOM-bypass + paint-only suffisent à défendre la perf.
2. **Tendance à inventer un détail technique sous pression** pour "faire pro". Mieux vaut une chaîne courte et exacte qu'une longue avec une affirmation fausse.
3. **Décrire la mécanique au lieu de justifier l'intention** quand la question demande "pourquoi" — réflexe à entraîner. Premier mot de la réponse = "parce que" ou "l'intention, c'est…".
4. **Listing au lieu de choisir** quand la question impose UNE chose — discipline à tenir.
5. **Apologétique sur ses propres références** ("ce n'est pas interactif", "je m'excuse", "je divague") — auto-déflations à supprimer.

### Vérifications factuelles à faire AVANT l'oral

| À vérifier | Pourquoi | Action |
|---|---|---|
| `will-change` présent ou absent dans Header.scss / HeaderSection.tsx | Mentionné en récit, à confirmer dans le code | Grep + lecture |
| Réalisateur de **Perfect Blue** | Attribué à Aronofsky en simulation — c'est probablement Satoshi Kon | Vérifier sur IMDB ou Wikipédia |
| Nom exact du programme Gobelins (acronyme officiel) | A dit "ECNI = Expertise en Création Numérique Interactive" | Vérifier sur le dossier d'inscription / site Gobelins |
| Identité de la typo "ronde, taches de peinture" attribuée à Robial | Description ne correspond pas au corpus le plus connu de Robial — peut être Excoffon (Mistral, Choc, Banco) ou un autre | Retrouver la photo sur téléphone, mémoriser nom typo + nom complet du designer |
| 2-3 portfolios light mode défendables | Réponse vague hier (Bruno Simon, "une galerie de musée vue sur Awwwards") | Faire une short-list de noms réels |

### Lexique à durcir

- "**Positional audio**" — pas "projectional audio" (Three.js : classe `PositionalAudio`)
- "**Cross-billboard**" pour ce qu'il a fait dans le TP HETIC — pas "imposter" au sens strict (vrais imposters = multi-vues bakées dans atlas)
- "**Throttle / requestAnimationFrame**" pour limiter la fréquence d'un handler — pas "debounce" (qui retarde jusqu'au silence, casserait la fluidité)
- "**Sora par Jonathan Barnbrook**" sur Google Fonts — pas par Soroban (erreur du précédent agent, déjà corrigée)
- **WCAG niveaux** : A obligatoire de base, AA = référence légale française pour sites publics, AAA = aspirationnel. `prefers-reduced-motion` = WCAG 2.3.3 niveau AAA.

### Checklist de polissage code (optionnel mais valorisant)

Si du temps avant l'oral :
- [ ] Gater `handleH1Wght` dans `HeaderSection` derrière `usePrefersReducedMotion` (no-op si reduced motion)
- [ ] Court-circuiter le `h-[600vh]` du `ProjectsSection` quand reduced motion est actif
- [ ] Mettre la ref `<header>` en cache via `useRef` au lieu de `querySelector` à chaque mousemove
- [ ] Remplacer `alt="Image"` sur les images de projet par des alts descriptifs
- [ ] Ajouter `tabIndex` + `role="button"` (ou passer en `<a href>`) sur les `ProjectTile` pour navigation clavier
- [ ] Ajouter `role="region" aria-label="Projets"` sur la section carousel

### Prochaines sessions de drill suggérées

1. **Présentation libre** (2 min, à mémoriser approximativement)
2. **Stack & choix techniques** (Tailwind/SCSS, deux libs anim, react-admin, zustand)
3. **SEO V1 vs V2** (chiffres, JSON-LD strategy, Lighthouse)
4. **Anglais** — bloc spécifique : créatif + entrepreneurial + culture internationale (PAS tech, contrairement à ce que la section I du document suggère)

### Posture générale à incarner en oral

- Sparring partner intellectuel, pas candidat soumis
- Honnêteté > vernis (un déficit nommé > un déficit dissimulé)
- Devancer les pièges connus (cf. section K) plutôt que les subir
- Une référence + un pont concret > trois references sans pont
- Premier mot d'une réponse "pourquoi" = "parce que…"

---

*Dernière mise à jour : 2026-04-29 (handoff post-simulation orale en deux sessions). Audit initial basé sur la branche `develop`, commit `ba46358`. Mise à jour `prefers-reduced-motion` après implémentation V2.1. Section 6 ajoutée pour reprise propre dans un nouveau chat.*
