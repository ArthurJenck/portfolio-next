# Documentation Backend - Portfolio Arthur Jenck

Ce document vous guide pour configurer et utiliser le backend de votre portfolio avec Payload CMS et MongoDB Atlas.

---

## ✅ Checklist des Actions Manuelles Requises

### 1. Configuration MongoDB Atlas

- [ ] **Créer un compte MongoDB Atlas**
    - Aller sur https://www.mongodb.com/cloud/atlas
    - S'inscrire avec votre email
    - Vérifier votre compte

- [ ] **Créer un cluster gratuit (M0)**
    - Dans le dashboard MongoDB Atlas, cliquer sur "Build a Database"
    - Choisir l'option **FREE (M0)**
    - Sélectionner un provider (AWS/Google/Azure) et une région proche (Europe de l'Ouest recommandé)
    - Nommer votre cluster (ex: `portfolio-cluster`)
    - Cliquer sur "Create"

- [ ] **Créer un utilisateur de base de données**
    - Dans "Security > Database Access", cliquer sur "Add New Database User"
    - Choisir "Password" comme méthode d'authentification
    - Créer un username (ex: `portfolio-admin`)
    - Générer un mot de passe **FORT** et le noter quelque part de sûr
    - Assigner le rôle "Read and write to any database"
    - Cliquer sur "Add User"

- [ ] **Configurer l'accès réseau**
    - Dans "Security > Network Access", cliquer sur "Add IP Address"
    - Cliquer sur "Allow Access from Anywhere" (ajoute `0.0.0.0/0`)
    - ⚠️ Ceci est nécessaire pour Vercel et le développement local
    - Cliquer sur "Confirm"

- [ ] **Récupérer la connection string**
    - Dans "Deployment > Database", cliquer sur "Connect" sur votre cluster
    - Choisir "Connect your application"
    - Copier la connection string (format: `mongodb+srv://...`)
    - **Important** : Remplacer `<password>` par votre mot de passe utilisateur
    - **Important** : Remplacer `<dbname>` par le nom de votre base (ex: `portfolio`)
    - Exemple final : `mongodb+srv://portfolio-admin:VotreMotDePasse@portfolio-cluster.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority`

### 2. Configuration Locale (.env.local)

- [ ] **Créer le fichier `.env.local`** à la racine du projet
- [ ] **Ajouter les variables d'environnement suivantes** :

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://votre-user:votre-password@votre-cluster.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority

# Payload Secret (générer une chaîne aléatoire sécurisée)
# Vous pouvez utiliser: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
PAYLOAD_SECRET=votre-secret-aleatoire-tres-long-et-securise

# URL de l'API (en local)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

- [ ] **Générer un PAYLOAD_SECRET sécurisé**
    - Ouvrir un terminal et exécuter :
        ```bash
        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        ```
    - Copier le résultat dans `.env.local`

### 3. Premier Lancement Local

- [ ] **Installer les dépendances** (si ce n'est pas déjà fait)

    ```bash
    npm install
    ```

- [ ] **Lancer le serveur de développement**

    ```bash
    npm run dev
    ```

- [ ] **Créer votre compte admin**
    - Ouvrir votre navigateur sur http://localhost:3000/admin
    - Vous serez redirigé vers `/admin/create-first-user`
    - Remplir le formulaire avec votre email et mot de passe
    - **⚠️ IMPORTANT** : Notez bien ces identifiants, vous en aurez besoin pour vous connecter !
    - Cliquer sur "Create"

- [ ] **Se connecter à l'admin**
    - Vous êtes maintenant connecté à l'interface admin
    - Vous pouvez commencer à ajouter des données

### 4. Configuration Vercel

- [ ] **Pousser le code sur GitHub**

    ```bash
    git add .
    git commit -m "Add Payload CMS backend"
    git push origin main
    ```

- [ ] **Connecter le repository à Vercel**
    - Aller sur https://vercel.com
    - Se connecter et cliquer sur "New Project"
    - Importer votre repository GitHub `portfolio-next`
    - **NE PAS** déployer tout de suite

- [ ] **Ajouter les variables d'environnement sur Vercel**
    - Dans les settings du projet Vercel, aller dans "Environment Variables"
    - Ajouter les 3 variables suivantes :
        - `MONGODB_URI` → Votre connection string MongoDB
        - `PAYLOAD_SECRET` → Votre secret généré (le même que dans `.env.local`)
        - `NEXT_PUBLIC_API_URL` → `https://votre-site.vercel.app` (ou votre domaine custom)
    - ⚠️ **Astuce** : Vous pouvez créer des "secrets" Vercel pour plus de sécurité

- [ ] **Déployer**
    - Cliquer sur "Deploy"
    - Attendre la fin du build (2-3 minutes)
    - Votre site est en ligne ! 🎉

### 5. Configuration Domaine Custom (Optionnel)

- [ ] **Ajouter un domaine custom sur Vercel**
    - Dans les settings du projet, aller dans "Domains"
    - Ajouter votre domaine (ex: `arthurjenck.com`)
    - Vercel vous donnera les enregistrements DNS à configurer

- [ ] **Configurer les DNS chez Hostinger**
    - Se connecter à votre compte Hostinger
    - Aller dans "Domaines > DNS / Serveurs de noms"
    - Ajouter les enregistrements fournis par Vercel :
        - Type `A` → IP de Vercel
        - Type `CNAME` → `cname.vercel-dns.com`
    - Attendre la propagation DNS (5 minutes à 48h, généralement ~30 min)

- [ ] **Mettre à jour NEXT_PUBLIC_API_URL**
    - Dans les variables d'environnement Vercel, modifier `NEXT_PUBLIC_API_URL`
    - Remplacer par votre domaine : `https://arthurjenck.com`
    - Redéployer le projet

- [ ] **Gérer l'ancien site Hostinger** (si applicable)
    - Option 1 : Le déplacer sur un sous-domaine (ex: `old.arthurjenck.com`)
    - Option 2 : Le désactiver complètement

---

## 📚 Guide d'Utilisation

### Accéder à l'interface admin

**Local** : http://localhost:3000/admin  
**Production** : https://arthurjenck.com/admin

Connectez-vous avec l'email et le mot de passe que vous avez créés.

### Structure des Collections

L'admin contient 5 collections :

#### 1. **Users** (Utilisateurs)

Gère les comptes admin. Vous devriez avoir uniquement votre compte.

#### 2. **Media** (Images)

Upload et gestion des images.

- **Comment uploader** :
    - Aller dans "Media" > "Create New"
    - Glisser-déposer une image ou cliquer pour parcourir
    - Ajouter un texte alternatif (optionnel mais recommandé pour l'accessibilité)
    - Sauvegarder
- **Formats générés** : Payload génère automatiquement 3 formats (thumbnail, card, tablet)
- **URL de l'image** : Une fois uploadée, l'image est accessible via `/uploads/nom-fichier.ext`

#### 3. **Techs** (Technologies)

Liste des technologies/langages utilisés.

**Champs** :

- `title` : Nom de la technologie (ex: "React", "Node.js")
- `icon` : Chemin vers l'icône (ex: `/assets/icons/techs/react.svg`)
- `activeIcon` : Chemin vers l'icône active
- `inactiveIcon` : Chemin vers l'icône inactive
- `order` : Ordre d'affichage (nombre)
- `active` : Si la technologie est active ou non

#### 4. **Skills** (Compétences)

Liste de vos compétences.

**Champs** :

- `category` : Front-end / Back-end / Outils
- `name` : Nom de la compétence (ex: "React", "TypeScript")
- `icon` : Chemin vers l'icône
- `description` : Texte de description

#### 5. **Projects** (Projets)

Vos projets portfolio.

**Champs** :

- `name` : Nom du projet
- `date` : Date du projet (format JJ/MM/AAAA)
- `description` : Description longue du projet
- `technologies` : Sélection multiple des technologies utilisées (relationship vers Techs)
- `githubLink` : Lien vers le repository GitHub (optionnel)
- `webLink` : Lien vers le site en ligne (optionnel)
- `images` : Sélection multiple d'images (relationship vers Media)

**Workflow recommandé** :

1. D'abord créer les **Techs**
2. Ensuite uploader les **Media** (images)
3. Puis créer les **Skills**
4. Enfin créer les **Projects** (qui référencent Techs et Media)

### Ajouter des données

1. **Cliquer sur une collection** dans le menu de gauche
2. **Cliquer sur "Create New"** en haut à droite
3. **Remplir les champs** (les champs requis sont marqués d'un astérisque \*)
4. **Cliquer sur "Save"** en bas de la page
5. Les données sont **immédiatement disponibles** sur le site via les API

### Modifier des données

1. **Aller dans la collection** concernée
2. **Cliquer sur l'élément** à modifier
3. **Modifier les champs**
4. **Cliquer sur "Save"**
5. Les changements sont **immédiatement visibles** sur le site

### Supprimer des données

1. **Aller dans la collection** concernée
2. **Cocher la case** de l'élément à supprimer
3. **Cliquer sur "Delete"** dans la barre d'actions en haut
4. **Confirmer la suppression**

---

## 🔌 API Routes

Toutes les collections sont exposées via des API REST automatiques.

### Endpoints disponibles

| Collection | Endpoint             | Méthode | Description                   |
| ---------- | -------------------- | ------- | ----------------------------- |
| Projects   | `/api/projects`      | GET     | Liste tous les projets        |
| Projects   | `/api/projects/[id]` | GET     | Récupère un projet spécifique |
| Skills     | `/api/skills`        | GET     | Liste toutes les compétences  |
| Techs      | `/api/techs`         | GET     | Liste toutes les technologies |

### Exemple d'utilisation

**Récupérer tous les projets** :

```javascript
const response = await fetch("https://arthurjenck.com/api/projects")
const projects = await response.json()
```

**Récupérer les skills** :

```javascript
const response = await fetch("https://arthurjenck.com/api/skills")
const skills = await response.json()
```

### Frontend - TanStack Query

Le frontend utilise **TanStack Query** pour gérer les données.

**Hooks disponibles** :

- `useProjects()` - Récupère tous les projets
- `useProject(id)` - Récupère un projet spécifique
- `useSkills()` - Récupère toutes les compétences
- `useTechs()` - Récupère toutes les technologies

**Exemple d'utilisation dans un composant** :

```typescript
'use client'

import { useSkills } from '@/hooks/useSkills'

export default function MyComponent() {
  const { data: skills, isLoading, error } = useSkills()

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>Erreur : {error.message}</div>

  return (
    <div>
      {skills?.map(skill => (
        <div key={skill.id}>{skill.name}</div>
      ))}
    </div>
  )
}
```

**Prefetch** : Toutes les données sont préchargées au chargement de la page via `PrefetchProvider`.

---

## 🔄 Migration du Frontend vers les API

Pour l'instant, le frontend utilise encore les fichiers statiques `src/data/projects.ts`, `src/data/skills.ts`, etc.

**Quand vous serez prêt à basculer**, voici la marche à suivre :

### Étape 1 : Remplacer les imports

**Avant** :

```typescript
import { projectsArr } from "@/data/projects"
```

**Après** :

```typescript
import { useProjects } from "@/hooks/useProjects"
```

### Étape 2 : Utiliser les hooks

**Avant** :

```typescript
const projects = projectsArr
```

**Après** :

```typescript
const { data: projects } = useProjects()
```

### Étape 3 : Adapter les types

Les types des données API sont légèrement différents. Consultez :

- `src/api/projectsApi.ts` - Types pour les projets
- `src/api/skillsApi.ts` - Types pour les compétences
- `src/api/techsApi.ts` - Types pour les technologies

### Étape 4 : Gérer les images

**Avant** : Les images étaient importées statiquement
**Après** : Les images sont des objets Media avec des URLs

```typescript
// Ancienne méthode
<img src={project.picDesk} alt={project.name} />

// Nouvelle méthode
{project.images?.[0] && typeof project.images[0] !== 'string' && (
  <img src={project.images[0].url} alt={project.images[0].alt || project.name} />
)}
```

---

## 🐛 Dépannage

### Erreur "Cannot connect to MongoDB"

- Vérifiez que votre `MONGODB_URI` est correct
- Vérifiez que vous avez whitelisté les IPs (0.0.0.0/0)
- Vérifiez que vous avez remplacé `<password>` par votre vrai mot de passe

### L'admin ne s'affiche pas

- Vérifiez que vous êtes bien sur `/admin` (avec le slash)
- Vérifiez que le serveur dev tourne (`npm run dev`)
- Regardez la console du terminal pour des erreurs

### Les données ne s'affichent pas sur le site

- Pour l'instant c'est normal, le frontend utilise encore `src/data/`
- Une fois que vous basculez vers les API, utilisez les hooks TanStack Query

### Erreur lors de l'upload d'images

- Vérifiez que le dossier `public/uploads/` existe (créé automatiquement)
- Vérifiez les permissions du dossier
- Vérifiez la taille de l'image (< 10 MB recommandé)

### Le build Vercel échoue

- Vérifiez que toutes les variables d'environnement sont bien configurées
- Regardez les logs de build dans Vercel
- Vérifiez qu'il n'y a pas d'erreurs TypeScript localement

---

## 📝 Notes Importantes

- **Frontend actuel** : Continue d'utiliser `src/data/*.ts` - **aucun changement nécessaire**
- **Backend prêt** : Vous pouvez dès maintenant ajouter des données via `/admin`
- **Migration progressive** : Basculez composant par composant vers les API quand vous êtes prêt
- **Images** : Les images uploadées via l'admin sont stockées dans `public/uploads/`
- **Sécurité** : Seuls les utilisateurs authentifiés peuvent modifier les données
- **Gratuit** : MongoDB Atlas (512 MB) + Vercel (hobby) = 100% gratuit

---

## 🚀 Commandes Utiles

```bash
# Lancer le serveur de développement
npm run dev

# Builder le projet (pour tester avant de déployer)
npm run build

# Démarrer en production (après build)
npm start

# Générer un secret Payload
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez les logs (terminal ou console navigateur)
2. Vérifiez cette documentation
3. Consultez la doc officielle Payload : https://payloadcms.com/docs
4. Vérifiez la configuration MongoDB Atlas

---

**Bon développement ! 🎉**
