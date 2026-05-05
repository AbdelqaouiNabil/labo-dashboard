# 🚀 Guide Claude Code — Comment utiliser les prompts

## Comment utiliser ce projet avec Claude Code

### 1. Ouvre Claude Code dans ton terminal
```bash
claude
```

### 2. Exécute les prompts dans l'ordre

Copie chaque prompt du fichier PROMPTS.md et colle-le dans Claude Code.
Attends que Claude Code finisse chaque étape avant de passer à la suivante.

### Ordre d'exécution recommandé:

```
ÉTAPE 0  → Setup du projet (npx create-next-app...)
ÉTAPE 1  → Types TypeScript
ÉTAPE 2  → Supabase client browser
ÉTAPE 3  → Supabase client server
ÉTAPE 4  → Middleware auth
ÉTAPE 5  → Utils
ÉTAPE 6  → Hook useConversations
ÉTAPE 7  → Hook useMessages
ÉTAPE 8  → Hook useRealtime
ÉTAPE 9  → Layout root
ÉTAPE 10 → Sidebar
ÉTAPE 11 → Header
ÉTAPE 12 → AIHumanToggle
ÉTAPE 13 → MessageBubble
ÉTAPE 14 → ChatView
ÉTAPE 15 → ConversationItem
ÉTAPE 16 → ConversationList
ÉTAPE 17 → Page Conversations
ÉTAPE 18 → StatsCard
ÉTAPE 19 → RecentActivity
ÉTAPE 20 → Page Dashboard Home
ÉTAPE 21 → StatusBadge
ÉTAPE 22 → AppointmentTable
ÉTAPE 23 → Page Appointments
ÉTAPE 24 → MessagesChart
ÉTAPE 25 → ActivityHeatmap
ÉTAPE 26 → Page Analytics
ÉTAPE 27 → Page Login
ÉTAPE 28 → API route mode toggle
ÉTAPE 29 → API route stats
ÉTAPE 30 → Finalisation & build
DEPLOY   → Vercel deployment
```

### Tips pour Claude Code

- Si une erreur de build apparaît, montre l'erreur à Claude Code et demande: "Fix this TypeScript error"
- Si un composant ne s'affiche pas correctement: "The [ComponentName] is not rendering correctly, fix it"
- Pour ajouter une fonctionnalité: colle juste la demande directement

### Variables d'environnement à remplir dans .env.local

Après l'étape 0, remplis le fichier .env.local avec tes vraies valeurs Supabase:
- Va dans Supabase Dashboard → Settings → API
- Copie "Project URL" → NEXT_PUBLIC_SUPABASE_URL
- Copie "anon public" key → NEXT_PUBLIC_SUPABASE_ANON_KEY
- Copie "service_role secret" key → SUPABASE_SERVICE_ROLE_KEY

### Lancer en développement

```bash
npm run dev
# Ouvre http://localhost:3000
```

### Déployer sur Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts, then add env vars in Vercel dashboard
```
