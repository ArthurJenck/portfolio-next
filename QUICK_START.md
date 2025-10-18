# 🚀 Démarrage Rapide - Backend Payload

## ✅ Ce qui a été fait

✔️ **Payload CMS** installé et configuré  
✔️ **5 Collections** créées : Users, Media, Projects, Skills, Techs  
✔️ **API Routes** fonctionnelles pour récupérer les données  
✔️ **TanStack Query** configuré avec prefetch automatique  
✔️ **Hooks** prêts à l'emploi : `useProjects()`, `useSkills()`, `useTechs()`  
✔️ **Build Next.js** validé et fonctionnel  
✔️ **Documentation** complète dans `BACKEND.md`

## 🎯 Prochaines étapes (VOUS DEVEZ FAIRE)

### 1. Configuration MongoDB Atlas (5 minutes)

Suivez la checklist dans `BACKEND.md` section 1 :

- Créer un compte MongoDB Atlas
- Créer un cluster gratuit M0
- Créer un utilisateur de base de données
- Récupérer la connection string

### 2. Créer le fichier `.env.local` (2 minutes)

À la racine du projet, créer `.env.local` :

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://votre-user:votre-password@cluster.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority

# Payload Secret (générer avec la commande ci-dessous)
PAYLOAD_SECRET=votre-secret-64-caracteres

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Générer le PAYLOAD_SECRET** :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Lancer le serveur (1 minute)

```bash
npm run dev
```

### 4. Créer votre compte admin (1 minute)

1. Ouvrir http://localhost:3000/admin
2. Vous serez redirigé vers `/admin/create-first-user`
3. Entrer votre email et mot de passe
4. Valider

### 5. Ajouter vos données (variable)

Via l'interface admin http://localhost:3000/admin :

1. **Techs** : Créer les technologies (React, Node.js, etc.)
2. **Media** : Uploader vos images de projets
3. **Skills** : Ajouter vos compétences
4. **Projects** : Créer vos projets (avec relations vers Techs et Media)

## 🔌 Utiliser les données dans le frontend

### Option 1 : Les données sont déjà prefetchées !

Les hooks sont déjà disponibles :

```typescript
import { useProjects } from "@/hooks/useProjects"
import { useSkills } from "@/hooks/useSkills"
import { useTechs } from "@/hooks/useTechs"

// Dans un composant client
const { data: projects, isLoading } = useProjects()
const { data: skills } = useSkills()
const { data: techs } = useTechs()
```

### Option 2 : Garder les données statiques (actuellement)

Le frontend continue d'utiliser `src/data/*.ts` pour l'instant.  
Vous pouvez migrer composant par composant quand vous êtes prêt.

## 📊 Structure des données

### Projects

```typescript
{
  id: string
  name: string
  date: string
  description: string
  technologies?: Tech[]
  githubLink?: string
  webLink?: string
  images?: Media[]
}
```

### Skills

```typescript
{
  id: string
  category: 'Front-end' | 'Back-end' | 'Outils'
  name: string
  icon?: string
  description?: string
}
```

### Techs

```typescript
{
  id: string
  title: string
  icon?: string
  activeIcon?: string
  inactiveIcon?: string
  order: number
  active: boolean
}
```

### Media (images uploadées)

```typescript
{
  id: string
  url: string  // URL complète de l'image
  alt?: string
  filename: string
  width?: number
  height?: number
  sizes?: {
    thumbnail: { url, width, height }
    card: { url, width, height }
    tablet: { url, width, height }
  }
}
```

## 🌐 Déploiement sur Vercel

Consultez `BACKEND.md` section 4 pour :

- Connecter GitHub à Vercel
- Ajouter les variables d'environnement
- Configurer votre domaine custom
- Déployer !

## 📚 Documentation complète

Tout est détaillé dans **`BACKEND.md`** :

- Configuration MongoDB Atlas étape par étape
- Guide d'utilisation de l'admin
- Structure des collections
- Migration du frontend vers les API
- Dépannage
- Commandes utiles

## ❓ Besoin d'aide ?

1. ✅ Vérifiez `BACKEND.md` - Checklist et troubleshooting
2. ✅ Consultez les logs du terminal
3. ✅ Vérifiez la console du navigateur
4. ✅ Doc Payload : https://payloadcms.com/docs

---

**Temps estimé total : 10-15 minutes** pour avoir un backend fonctionnel ! 🎉
