# 🤖 Claude Code Prompts — Labo Maghreb Arabi Dashboard

Ce fichier contient tous les prompts à donner à Claude Code pour générer chaque fichier du projet.
Exécute-les dans l'ordre.

---

## ÉTAPE 0 — SETUP INITIAL

```
Initialize a Next.js 14 project called "labo-dashboard" with:
- TypeScript
- Tailwind CSS
- App Router
- ESLint

Then install these dependencies:
- @supabase/supabase-js
- @supabase/ssr
- recharts
- lucide-react
- date-fns
- clsx
- tailwind-merge

Then initialize shadcn/ui with the "slate" base color and CSS variables enabled.

Install these shadcn components:
button, card, badge, input, label, select, separator, sheet, skeleton, 
switch, table, tabs, toast, tooltip, avatar, dropdown-menu, dialog, scroll-area

Create a .env.local file with:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## ÉTAPE 1 — LIB/SUPABASE/TYPES.TS

```
Create the file lib/supabase/types.ts with TypeScript types matching this PostgreSQL schema:

Tables:
1. contacts: id (uuid), phone (text), name (text), language (text), created_at (timestamp)
2. conversations: id (uuid), contact_id (uuid FK contacts), mode (text: 'ai'|'human'), assigned_to (text), last_message_at (timestamp), created_at (timestamp)
3. messages: id (uuid), contact_id (uuid FK contacts), direction (text: 'inbound'|'outbound'), message (text), type (text), media_url (text), created_at (timestamp)
4. appointments: id (uuid), contact_id (uuid FK contacts), reservation_type (text: 'home_kenitra'|'home_outside'|'onsite'), service (text), total_price (numeric), travel_fee (numeric), final_price (numeric), status (text: 'pending'|'confirmed'|'cancelled'), appointment_date (timestamp), notes (text), created_at (timestamp)
5. documents: id (uuid), contact_id (uuid FK contacts), type (text), file_url (text), extracted_text (text), created_at (timestamp)

Also create a Database type for Supabase client typing.
Export all types individually.
Also export a ConversationWithContact type that joins conversations with contacts.
Export a MessageWithContact type that joins messages with contacts.
```

---

## ÉTAPE 2 — LIB/SUPABASE/CLIENT.TS

```
Create lib/supabase/client.ts:

Create a Supabase browser client using createBrowserClient from @supabase/ssr.
Use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.
Export a singleton createClient function.
Import the Database type from ./types.
```

---

## ÉTAPE 3 — LIB/SUPABASE/SERVER.TS

```
Create lib/supabase/server.ts:

Create a Supabase server client using createServerClient from @supabase/ssr.
Handle cookies using the Next.js cookies() from next/headers.
Import the Database type from ./types.
Export a createClient async function for use in Server Components and API routes.
```

---

## ÉTAPE 4 — MIDDLEWARE.TS

```
Create middleware.ts at the root of the project:

Use @supabase/ssr to create a middleware that:
1. Refreshes the Supabase auth session on every request
2. Redirects unauthenticated users to /login if they try to access any page except /login
3. Redirects authenticated users away from /login to /
4. Matches all routes except static files, _next, and favicon

Use the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.
```

---

## ÉTAPE 5 — LIB/UTILS.TS

```
Create lib/utils.ts with these utility functions:

1. cn(...inputs) - combines clsx and tailwind-merge for className merging
2. formatPhone(phone: string) - formats "212666737207" to "+212 666-737-207"
3. formatRelativeTime(date: string | Date) - returns "Il y a 5 min", "Il y a 2h", "Hier", or formatted date in French
4. getInitials(name: string) - returns first 2 initials uppercase
5. truncateMessage(message: string, maxLength: number = 60) - truncates with ellipsis
6. getModeColor(mode: 'ai' | 'human') - returns Tailwind color class
7. getStatusColor(status: 'pending' | 'confirmed' | 'cancelled') - returns Tailwind color class
8. getDirectionLabel(direction: 'inbound' | 'outbound') - returns emoji + label

All French labels.
```

---

## ÉTAPE 6 — HOOKS/USECONVERSATIONS.TS

```
Create hooks/useConversations.ts:

A custom React hook that:
1. Fetches conversations from Supabase joining with contacts table
2. Orders by last_message_at DESC
3. Supports filtering by mode ('ai' | 'human' | 'all')
4. Supports search by contact name or phone
5. Returns { conversations, loading, error, refetch }
6. Uses the browser Supabase client from lib/supabase/client.ts
7. Type: ConversationWithContact[] from lib/supabase/types.ts
```

---

## ÉTAPE 7 — HOOKS/USEMESSAGES.TS

```
Create hooks/useMessages.ts:

A custom React hook that:
1. Takes a contactId as parameter
2. Fetches messages for that contact ordered by created_at ASC
3. Returns { messages, loading, error }
4. Uses the browser Supabase client
5. Types from lib/supabase/types.ts
```

---

## ÉTAPE 8 — HOOKS/USEREALTIME.TS

```
Create hooks/useRealtime.ts:

A custom React hook that:
1. Subscribes to Supabase Realtime on the 'messages' table for INSERT events
2. Filters by contact_id if provided
3. Takes a callback onNewMessage(message) that is called when a new message arrives
4. Properly unsubscribes on component unmount
5. Also exports a useConversationRealtime hook that listens for conversation mode changes
6. Uses the browser Supabase client
```

---

## ÉTAPE 9 — APP/LAYOUT.TSX

```
Create app/layout.tsx:

The root layout with:
1. Google Fonts: Import "DM Sans" (400, 500, 600) and "DM Mono" (400) 
2. Tailwind CSS dark mode class strategy
3. A Toaster component from shadcn for notifications
4. metadata with title "Labo Maghreb Arabi — Dashboard" and description
5. Clean body with the DM Sans font applied
6. Background color: bg-slate-50 dark:bg-slate-950
7. No sidebar here — just the base shell
```

---

## ÉTAPE 10 — COMPONENTS/LAYOUT/SIDEBAR.TSX

```
Create components/layout/Sidebar.tsx:

A responsive sidebar navigation component with:

Design: Clean, medical/professional feel. Dark sidebar (slate-900) with white text.
Logo area at top: Green circle with "LMA" initials + "Labo Maghreb Arabi" text + "Dashboard" subtitle in smaller muted text.

Navigation items with icons (lucide-react):
- Dashboard (LayoutDashboard icon) → href="/"
- Conversations (MessageSquare icon) → href="/conversations" — show a badge with count of unread/AI conversations
- Rendez-vous (Calendar icon) → href="/appointments"
- Analytics (BarChart3 icon) → href="/analytics"

Bottom section:
- A status indicator showing "● Lina en ligne" with green dot
- User avatar + email from Supabase auth session
- Logout button

Active state: slate-700 background, green left border accent.
Mobile: Hidden on mobile, use a Sheet component for mobile drawer.
Use usePathname from next/navigation for active state.
Make it a Client Component.
```

---

## ÉTAPE 11 — COMPONENTS/LAYOUT/HEADER.TSX

```
Create components/layout/Header.tsx:

A top header bar with:
1. Page title (passed as prop)
2. Current date in French format (e.g., "Lundi 28 Avril 2026")
3. A search input (for conversations page)
4. A notification bell icon with badge
5. Mobile menu button that opens the Sidebar sheet

Props: { title: string, showSearch?: boolean, onSearch?: (q: string) => void }
Design: White background, subtle bottom border, height 64px.
Client Component.
```

---

## ÉTAPE 12 — COMPONENTS/CONVERSATIONS/AIHUMANTOGGLE.TSX

```
Create components/conversations/AIHumanToggle.tsx:

A toggle component that switches between AI and Human mode for a conversation.

Props: { conversationId: string, currentMode: 'ai' | 'human', onToggle?: (newMode: string) => void }

Design:
- Two buttons side by side: "🤖 IA" and "👤 Humain"  
- Active state: green background for AI, orange background for Human
- Loading spinner while updating
- Shows a toast notification on success/error

Functionality:
- On click, calls Supabase to UPDATE conversations SET mode = ? WHERE id = ?
- Uses the browser Supabase client
- Calls onToggle callback after success

Make it a Client Component with useState and useTransition.
```

---

## ÉTAPE 13 — COMPONENTS/CONVERSATIONS/MESSAGEBUBBLE.TSX

```
Create components/conversations/MessageBubble.tsx:

A chat message bubble component.

Props: { message: Message (from lib/supabase/types.ts) }

Design like WhatsApp:
- Inbound messages: Left aligned, white background, slate border
- Outbound messages: Right aligned, green background (#25D366 or similar), white text
- Message text with proper word wrap
- Timestamp bottom right in small muted text (use formatRelativeTime from utils)
- For type='imageMessage': show a image icon placeholder + "[Image reçue]" text
- For type='ptt': show a microphone icon + "[Message vocal]" text  
- For type='conversation': show normal text

Add subtle shadow and rounded corners (asymmetric: top-left corner flat for inbound, top-right flat for outbound).
Animate in with a subtle fade+slide up on mount.
```

---

## ÉTAPE 14 — COMPONENTS/CONVERSATIONS/CHATVIEW.TSX

```
Create components/conversations/ChatView.tsx:

The main chat view panel for a conversation.

Props: { contactId: string, conversationId: string }

Features:
1. Header with contact name, phone, avatar (initials), online status
2. AIHumanToggle component in the header
3. Scrollable messages list using useMessages hook
4. Auto-scrolls to bottom on new messages
5. Real-time updates using useRealtime hook
6. Loading skeleton while fetching
7. Empty state: "Aucun message" with icon
8. Messages grouped by date (show date separator: "Aujourd'hui", "Hier", actual date)

Design:
- WhatsApp-like chat background (subtle pattern or light gray)
- Messages container with proper padding
- Sticky date separators with pill style

Client Component.
```

---

## ÉTAPE 15 — COMPONENTS/CONVERSATIONS/CONVERSATIONITEM.TSX

```
Create components/conversations/ConversationItem.tsx:

A single conversation list item.

Props: { conversation: ConversationWithContact, isActive: boolean, onClick: () => void }

Design:
- Avatar with contact initials (colored based on name hash)
- Contact name (bold) + phone number (muted small)
- Last message preview (truncated 50 chars)
- Timestamp (relative) top right
- Mode badge: "🤖 IA" green or "👤 Humain" orange
- Subtle hover state
- Active state: light blue/green background with left border accent
- Unread indicator (if last message is inbound and recent)

Use formatPhone, formatRelativeTime, truncateMessage, getInitials from utils.
```

---

## ÉTAPE 16 — COMPONENTS/CONVERSATIONS/CONVERSATIONLIST.TSX

```
Create components/conversations/ConversationList.tsx:

The conversation list sidebar panel.

Props: { onSelectConversation: (id: string, contactId: string) => void, selectedId?: string }

Features:
1. Uses useConversations hook
2. Filter tabs: "Tous" | "IA" | "Humain" using shadcn Tabs
3. Search input that filters by name/phone
4. List of ConversationItem components
5. Loading state: 5 skeleton items
6. Empty state per filter
7. Total count display

Design:
- Fixed width panel (320px)
- Sticky filter tabs at top
- Scrollable list
- Subtle dividers between items

Client Component.
```

---

## ÉTAPE 17 — APP/CONVERSATIONS/PAGE.TSX

```
Create app/conversations/page.tsx:

The conversations page layout.

Design: Two-panel layout (like WhatsApp Web):
- Left panel (320px fixed): ConversationList component
- Right panel (flex-1): ChatView or empty state

Features:
1. Uses useState to track selectedConversationId and selectedContactId
2. When no conversation selected: show empty state with icon "Sélectionnez une conversation"
3. When selected: show ChatView component
4. Responsive: on mobile, show only list or only chat (not both)
5. URL sync: update URL param ?id=xxx when conversation is selected

Page title: "Conversations"
Server Component that renders client components.
```

---

## ÉTAPE 18 — COMPONENTS/DASHBOARD/STATSCARD.TSX

```
Create components/dashboard/StatsCard.tsx:

A statistics card component.

Props: { 
  title: string, 
  value: string | number, 
  subtitle?: string,
  icon: LucideIcon,
  trend?: { value: number, label: string },
  color?: 'green' | 'blue' | 'orange' | 'red'
}

Design:
- White card with subtle shadow
- Large number value (prominent)
- Icon in colored circle top right
- Trend indicator with up/down arrow (green if positive, red if negative)
- Hover: slight lift effect (translate-y)
- Smooth number animation on mount

Make it a Client Component for the animation.
```

---

## ÉTAPE 19 — COMPONENTS/DASHBOARD/RECENTACTIVITY.TSX

```
Create components/dashboard/RecentActivity.tsx:

Shows the last 10 messages received, as a live feed.

Features:
1. Fetches last 10 inbound messages joining with contacts
2. Real-time updates via useRealtime hook
3. Shows: avatar + name + message preview + time
4. Clicking an item navigates to /conversations?id=xxx
5. New messages animate in from top

Design:
- Compact list items
- Green dot animation for very recent messages (< 1 min)
- "Il y a Xs" live updating timestamps

Client Component.
```

---

## ÉTAPE 20 — APP/PAGE.TSX (DASHBOARD HOME)

```
Create app/page.tsx (the dashboard home):

A Server Component that fetches stats and renders the dashboard.

Layout:
- Header: "Bonjour 👋" + current date
- Stats grid (2x2 on desktop, 1 col on mobile):
  1. Total Contacts (Users icon, blue)
  2. Messages Aujourd'hui (MessageSquare, green) — count of messages created today
  3. Conversations Actives IA (Bot icon, green) — conversations with mode='ai'
  4. Rendez-vous en attente (Calendar icon, orange) — appointments with status='pending'

- Below stats: Two columns:
  Left (60%): RecentActivity component
  Right (40%): 
    - "Conversations Actives" mini list (last 5 conversations)
    - Link to /conversations

Fetch all stats server-side using Supabase server client.
Use StatsCard component for each stat.
```

---

## ÉTAPE 21 — COMPONENTS/APPOINTMENTS/STATUSBADGE.TSX

```
Create components/appointments/StatusBadge.tsx:

A badge component for appointment status.

Props: { status: 'pending' | 'confirmed' | 'cancelled', size?: 'sm' | 'md' }

- pending: Yellow badge "En attente" with clock icon
- confirmed: Green badge "Confirmé" with check icon  
- cancelled: Red badge "Annulé" with x icon

Use shadcn Badge component as base.
```

---

## ÉTAPE 22 — COMPONENTS/APPOINTMENTS/APPOINTMENTTABLE.TSX

```
Create components/appointments/AppointmentTable.tsx:

A full data table for appointments.

Features:
1. Fetches appointments joining with contacts from Supabase
2. Columns: Contact, Téléphone, Type, Service, Prix Final, Date, Statut, Actions
3. Filter by status (tabs: Tous / En attente / Confirmé / Annulé)
4. Inline status change: dropdown to change status → updates Supabase
5. Shows toast on status change
6. Loading skeleton (5 rows)
7. Empty state per filter
8. Pagination (10 per page)

Type column mapping:
- home_kenitra → "🏠 Domicile Kénitra"
- home_outside → "🚗 Domicile Hors ville"  
- onsite → "🏥 Sur place"

Use shadcn Table components.
Client Component.
```

---

## ÉTAPE 23 — APP/APPOINTMENTS/PAGE.TSX

```
Create app/appointments/page.tsx:

The appointments management page.

Layout:
- Header: "Rendez-vous" title
- Stats row: count of pending, confirmed, cancelled today
- AppointmentTable component below

Simple Server Component wrapper.
```

---

## ÉTAPE 24 — COMPONENTS/ANALYTICS/MESSAGESCHART.TSX

```
Create components/analytics/MessagesChart.tsx:

A messages per day chart using Recharts.

Props: { data: Array<{ date: string, inbound: number, outbound: number }> }

Design:
- AreaChart with two areas: inbound (green, 0.3 opacity) and outbound (blue, 0.3 opacity)
- Custom tooltip in French: "Reçus: X | Envoyés: Y"
- X axis: last 7 days in French ("Lun", "Mar", etc.)
- Smooth curves (type="monotone")
- Responsive container
- Legend below

Client Component.
```

---

## ÉTAPE 25 — COMPONENTS/ANALYTICS/ACTIVITYHEATMAP.TSX

```
Create components/analytics/ActivityHeatmap.tsx:

A heatmap showing activity by hour of day.

Props: { data: Array<{ hour: number, count: number }> }

Design:
- 24 cells (one per hour 0-23)
- Color intensity: white (0) to green (max)
- Labels: "00h", "01h", ... "23h"
- Tooltip showing count on hover
- Title: "Activité par heure"

Implemented as a custom grid using divs + Tailwind dynamic opacity.
Client Component.
```

---

## ÉTAPE 26 — APP/ANALYTICS/PAGE.TSX

```
Create app/analytics/page.tsx:

The analytics dashboard page.

Features - fetch server-side:
1. Messages per day for last 7 days (group by DATE(created_at))
2. Messages per hour (group by EXTRACT(HOUR FROM created_at)) for last 30 days
3. Total messages this month vs last month (with % change)
4. Most active contacts (top 5 by message count)
5. AI vs Human conversation ratio

Layout:
- Top stats row: Total ce mois, Variation vs mois dernier, Taux IA, Heure de pointe
- MessagesChart (full width)
- Two columns: ActivityHeatmap + Top Contacts table

Use Supabase server client for all queries.
French labels everywhere.
```

---

## ÉTAPE 27 — APP/(AUTH)/LOGIN/PAGE.TSX

```
Create app/(auth)/login/page.tsx:

A login page for the dashboard.

Design: Centered card on a dark background.
- Logo: Green circle "LMA" + "Labo Maghreb Arabi"
- Subtitle: "Dashboard Administrateur"
- Email input
- Password input  
- "Se connecter" button with loading state
- Error message display

Functionality:
- Uses Supabase auth signInWithPassword
- On success: redirect to /
- On error: show error message in French
  - "Email ou mot de passe incorrect"
  - "Trop de tentatives, réessayez plus tard"

Client Component.
No signup link (admin only).
```

---

## ÉTAPE 28 — APP/API/CONVERSATIONS/[ID]/MODE/ROUTE.TS

```
Create app/api/conversations/[id]/mode/route.ts:

A PATCH API route to toggle conversation mode.

- Accepts: { mode: 'ai' | 'human' }
- Validates mode value
- Updates conversations table in Supabase using service role key
- Returns updated conversation
- Protected: checks auth session
- Returns 401 if not authenticated
- Returns 400 if invalid mode
- Returns 200 with updated data on success

Use Supabase server client with service role for the update.
```

---

## ÉTAPE 29 — APP/API/STATS/ROUTE.TS

```
Create app/api/stats/route.ts:

A GET API route that returns dashboard stats.

Returns JSON with:
{
  totalContacts: number,
  messagesToday: number,
  activeAIConversations: number,
  pendingAppointments: number,
  newContactsToday: number
}

- Uses Supabase server client
- Protected with auth check
- Cache with revalidate: 60 seconds
```

---

## ÉTAPE 30 — FINALISATION & POLISH

```
Do a final review and fix of the entire project:

1. Make sure all imports are correct across all files
2. Add proper TypeScript types everywhere (no 'any')
3. Add loading.tsx files for each route segment:
   - app/loading.tsx
   - app/conversations/loading.tsx  
   - app/appointments/loading.tsx
   - app/analytics/loading.tsx
   Each showing a skeleton of the page layout.

4. Add error.tsx files:
   - app/error.tsx (global error boundary)
   - app/conversations/error.tsx

5. Add not-found.tsx

6. Update tailwind.config.ts to add:
   - Custom green color: #00B85F (labo brand green)
   - Animation for message bubble entrance
   - Custom font families for DM Sans and DM Mono

7. Make sure the Sidebar is included in a proper layout wrapper for all protected pages.
   Create app/(dashboard)/layout.tsx that wraps pages with Sidebar + Header.
   Move page.tsx, conversations/, appointments/, analytics/ under (dashboard)/ group.

8. Add a ThemeProvider if needed for dark mode support.

9. Verify all Supabase queries use proper TypeScript generics.

10. Test that the build compiles without errors: run `next build` and fix any issues.
```

---

## 🚀 DÉPLOIEMENT VERCEL

```
Prepare the project for Vercel deployment:

1. Make sure next.config.ts has proper image domains for Supabase storage
2. Create vercel.json if needed for any special configuration
3. List all environment variables needed in Vercel dashboard:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY  
   - SUPABASE_SERVICE_ROLE_KEY

4. Add a .gitignore that includes:
   - .env.local
   - .next/
   - node_modules/

5. Make sure package.json has correct build script.

Provide instructions for:
- Connecting GitHub repo to Vercel
- Adding env vars in Vercel dashboard
- Setting up Supabase Realtime (enable replication on messages and conversations tables)
- Creating the admin user in Supabase Auth dashboard
```
