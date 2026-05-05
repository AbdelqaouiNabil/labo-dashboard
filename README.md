# 🏥 Labo Maghreb Arabi — WhatsApp Dashboard

Dashboard de gestion des conversations WhatsApp pour le Laboratoire Maghreb Arabi à Kénitra.

## Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (PostgreSQL + Realtime + Auth)
- **Recharts** (Analytics)
- **Deploy**: Vercel

## Structure du projet

```
labo-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard home
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── conversations/
│   │   ├── page.tsx                # Liste conversations
│   │   └── [id]/page.tsx           # Chat view
│   ├── appointments/
│   │   └── page.tsx
│   └── analytics/
│       └── page.tsx
├── components/
│   ├── ui/                         # shadcn components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── conversations/
│   │   ├── ConversationList.tsx
│   │   ├── ConversationItem.tsx
│   │   ├── ChatView.tsx
│   │   ├── MessageBubble.tsx
│   │   └── AIHumanToggle.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   └── RecentActivity.tsx
│   ├── appointments/
│   │   ├── AppointmentTable.tsx
│   │   └── StatusBadge.tsx
│   └── analytics/
│       ├── MessagesChart.tsx
│       └── ActivityHeatmap.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── utils.ts
├── hooks/
│   ├── useConversations.ts
│   ├── useMessages.ts
│   └── useRealtime.ts
└── middleware.ts
```

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Setup

```bash
npx create-next-app@latest labo-dashboard --typescript --tailwind --app
cd labo-dashboard
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr recharts lucide-react date-fns
```
