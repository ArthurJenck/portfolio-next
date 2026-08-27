# Admin API — Référence curl

Base URL : `https://arthurjenck.com`  
Toutes les routes d'écriture exigent le header `Authorization: Bearer $ADMIN_API_TOKEN`.  
Les routes GET sont publiques sauf mention contraire.
Les mutations qui touchent le contenu public déclenchent une revalidation ciblée du portfolio (`/`, pages projet concernées, `/cv`, `sitemap`) pour republier les changements sans redeploy.

## Setup

```sh
# Générer un token (une seule fois, à ajouter dans .env.local ET dans les env vars Vercel)
openssl rand -hex 32

# Charger le token dans le shell courant
# NOTE : ne pas utiliser `source .env.local` — le & dans l'URI MongoDB casse le parsing.
# Utiliser grep à la place :
export ADMIN_API_TOKEN="$(grep '^ADMIN_API_TOKEN=' .env.local | cut -d= -f2-)"
```

---

## Upload d'image

```sh
# Upload d'un fichier local → renvoie { url, fileName }
curl -s -X POST https://arthurjenck.com/api/upload \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -F "file=@./cover.png" \
  -F "customName=mon-projet-cover.png"
```

`url` est l'URL publique Vercel Blob à injecter dans `cover_image`, `mobile_cover_image`, `medias[]` ou `medias[].mobileUrl`.

---

## Projects

```sh
# Lister tous les projets
curl -s https://arthurjenck.com/api/projects

# Récupérer un projet par ID
curl -s https://arthurjenck.com/api/projects/<id>

# Récupérer un projet par slug
curl -s https://arthurjenck.com/api/projects/slug/<slug>

# Créer un projet
# 1. Récupérer les _id des skills pour le champ stack
curl -s https://arthurjenck.com/api/skills/all | jq '.[].id'

# 2. Uploader la cover image (voir section Upload)

# 3. Créer le projet
curl -s -X POST https://arthurjenck.com/api/projects \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nom du projet",
    "subtitle": "Sous-titre optionnel",
    "date": "2024-06-01T00:00:00.000Z",
    "summary": "Résumé affiché en listing.",
    "description": "Paragraphe 1 en **Markdown**.\n\nParagraphe 2 en Markdown.\n\nParagraphe 3 en Markdown.",
    "cover_image": "https://xxxx.vercel-storage.com/cover.png",
    "mobile_cover_image": "https://xxxx.vercel-storage.com/cover-mobile.png",
    "stack": ["<skill_id_1>", "<skill_id_2>"],
    "medias": [
      { "url": "https://xxxx.vercel-storage.com/screen.png", "type": "image", "mobileUrl": "https://xxxx.vercel-storage.com/screen-mobile.png" }
    ],
    "githubLink": "https://github.com/...",
    "webLink": "https://...",
    "color": "#1a1a2e",
    "music": {
      "url": "https://xxxx.vercel-storage.com/track.mp3",
      "label": "Invader — Dance With The Dead",
      "startAt": 12.5,
      "volume": 0.5,
      "rootOffset": -2
    }
  }'

# Mettre à jour un projet (champs partiels acceptés)
curl -s -X PUT https://arthurjenck.com/api/projects/<id> \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "subtitle": "Nouveau sous-titre" }'

# Supprimer un projet (supprime aussi les blobs Vercel associés)
curl -s -X DELETE https://arthurjenck.com/api/projects/<id> \
  -H "Authorization: Bearer $ADMIN_API_TOKEN"

# Mettre à jour la stack d'un projet
curl -s -X PUT https://arthurjenck.com/api/projects/<id>/skills \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "skillIds": ["<skill_id_1>", "<skill_id_2>"] }'

# Lister les skills d'un projet avec leur statut assigned (auth requis)
curl -s https://arthurjenck.com/api/projects/<id>/skills \
  -H "Authorization: Bearer $ADMIN_API_TOKEN"
```

**Gotchas** :
- `name`, `date`, `summary`, `description`, `cover_image` sont requis à la création
- `description` accepte du Markdown : séparer chaque paragraphe par une ligne vide (`\n\n`). Sur la page projet, chaque paragraphe devient une colonne.
- `slug` est auto-généré depuis `name` si absent (alphanumérique + tirets, unique)
- `color` est normalisée (hex : `#rgb`, `#rrggbb`, `#rrggbbaa`)
- `stack` attend des ObjectId Mongo en string — récupérer les IDs via `/api/skills/all` d'abord
- `medias[]` est auto-rempli avec `cover_image` si absent/vide à la création
- `mobile_cover_image` est optionnel — si absent, la cover desktop est affichée sur mobile (fallback automatique)
- `medias[].mobileUrl` est optionnel — si absent, `medias[].url` est affiché sur tous les viewports
- `date` en ISO 8601 : `"2024-06-01T00:00:00.000Z"`
- `music` est optionnel — remplace l'ambiance générative par ce mp3 sur la page du projet. `url` seul est requis si présent ; `label` est optionnel — vide, aucun titre ne s'affiche à côté du visualizer (cas d'une ambiance sans crédit à donner, ex : Le Lac de Ronart) ; `startAt` (secondes, décimales acceptées — ex: `12.5`) ne s'applique qu'au premier lancement, la boucle repart ensuite à 0 ; `volume` (0–1, défaut 0.5) ; `rootOffset` (demi-tons vs Ré2, -6 à 5) accorde les SFX de micro-interaction sur la tonalité du morceau. Envoyer `"music": null` retire la musique et supprime le blob associé.

---

## Skills

```sh
# Lister les skills par catégorie (avec populate)
curl -s https://arthurjenck.com/api/skills

# Lister tous les skills à plat (utiliser pour récupérer les IDs)
curl -s https://arthurjenck.com/api/skills/all

# Récupérer un skill par ID
curl -s https://arthurjenck.com/api/skills/<id>

# Créer un skill
curl -s -X POST https://arthurjenck.com/api/skills \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TypeScript",
    "icon": "https://xxxx.vercel-storage.com/ts.svg",
    "description": "Langage typé pour JavaScript"
  }'

# Mettre à jour un skill (si icon change, l'ancien blob est supprimé)
curl -s -X PUT https://arthurjenck.com/api/skills/<id> \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "TypeScript 5" }'

# Supprimer un skill (supprime aussi l'icône Vercel Blob)
curl -s -X DELETE https://arthurjenck.com/api/skills/<id> \
  -H "Authorization: Bearer $ADMIN_API_TOKEN"

# Réordonner : déplacer un skill vers le haut ou le bas
curl -s -X POST https://arthurjenck.com/api/skills/reorder \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "skillId": "<id>", "direction": "up" }'
```

**Gotchas** :
- `name` et `icon` sont requis à la création
- `order` est auto-affecté (max existant + 1) si absent

---

## Skill categories

```sh
# Lister les catégories
curl -s https://arthurjenck.com/api/skill-categories

# Créer une catégorie
curl -s -X POST https://arthurjenck.com/api/skill-categories \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend",
    "truncatedName": "Front",
    "skills": ["<skill_id_1>"]
  }'

# Mettre à jour
curl -s -X PUT https://arthurjenck.com/api/skill-categories/<id> \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Frontend & UI" }'

# Supprimer
curl -s -X DELETE https://arthurjenck.com/api/skill-categories/<id> \
  -H "Authorization: Bearer $ADMIN_API_TOKEN"

# Réordonner
curl -s -X POST https://arthurjenck.com/api/skill-categories/reorder \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "categoryId": "<id>", "direction": "down" }'
```

**Gotchas** :
- `name` et `truncatedName` sont requis
- `skills` est un tableau d'ObjectId Mongo en string

---

## Contact links

```sh
# Lister
curl -s https://arthurjenck.com/api/contact-links

# Créer
curl -s -X POST https://arthurjenck.com/api/contact-links \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "href": "mailto:arthurjenckdev@gmail.com",
    "display_text": "Email",
    "copy_text": "arthurjenckdev@gmail.com"
  }'

# Mettre à jour
curl -s -X PUT https://arthurjenck.com/api/contact-links/<id> \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "display_text": "Mail" }'

# Supprimer
curl -s -X DELETE https://arthurjenck.com/api/contact-links/<id> \
  -H "Authorization: Bearer $ADMIN_API_TOKEN"

# Réordonner
curl -s -X POST https://arthurjenck.com/api/contact-links/reorder \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "contactLinkId": "<id>", "direction": "up" }'
```

---

## CV

Il n'y a qu'un seul CV en base (upsert automatique au POST).

```sh
# Récupérer le CV actuel
curl -s https://arthurjenck.com/api/cv

# Uploader un nouveau PDF et remplacer le CV
# 1. Uploader le fichier
URL=$(curl -s -X POST https://arthurjenck.com/api/upload \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -F "file=@./cv.pdf" \
  -F "customName=arthur-jenck-cv.pdf" | jq -r '.url')

# 2. Enregistrer l'URL en base (remplace l'ancien et supprime son blob)
curl -s -X POST https://arthurjenck.com/api/cv \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$URL\", \"fileName\": \"cv.pdf\", \"customName\": \"arthur-jenck-cv.pdf\"}"

# Supprimer le CV (supprime aussi le blob)
curl -s -X DELETE https://arthurjenck.com/api/cv/<id> \
  -H "Authorization: Bearer $ADMIN_API_TOKEN"
```

---

## Erreurs courantes

| Code | Cause probable |
|------|---------------|
| 401 | Token absent, incorrect ou `ADMIN_API_TOKEN` non défini en env |
| 404 | Mauvais `id` |
| 500 | Champ requis manquant, slug déjà existant, ObjectId invalide dans `stack` |

Pour déboguer un 500 : passer par les logs Vercel (onglet Deployments → Functions) ou ajouter `-v` au curl pour voir la réponse complète.
