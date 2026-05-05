# 🗄️ Supabase Setup — Labo Maghreb Arabi Dashboard

## 1. Enable Realtime

Dans Supabase Dashboard → Database → Replication, active les tables:
- `messages`
- `conversations`

## 2. Row Level Security (RLS)

Colle ce SQL dans Supabase → SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write all tables
CREATE POLICY "Authenticated users can read contacts" ON contacts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read conversations" ON conversations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read messages" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read appointments" ON appointments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read documents" ON documents
  FOR ALL USING (auth.role() = 'authenticated');
```

## 3. Créer l'utilisateur admin

Dans Supabase → Authentication → Users → "Add user":
- Email: admin@labo-maghreb.ma
- Password: (choisis un mot de passe sécurisé)

## 4. Stats Views (optionnel mais recommandé)

```sql
-- View for messages per day (last 30 days)
CREATE OR REPLACE VIEW messages_per_day AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE direction = 'inbound') as inbound,
  COUNT(*) FILTER (WHERE direction = 'outbound') as outbound,
  COUNT(*) as total
FROM messages
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View for messages per hour
CREATE OR REPLACE VIEW messages_per_hour AS
SELECT 
  EXTRACT(HOUR FROM created_at)::int as hour,
  COUNT(*) as count
FROM messages
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- View for dashboard stats
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM contacts) as total_contacts,
  (SELECT COUNT(*) FROM messages WHERE DATE(created_at) = CURRENT_DATE) as messages_today,
  (SELECT COUNT(*) FROM conversations WHERE mode = 'ai') as active_ai_conversations,
  (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pending_appointments,
  (SELECT COUNT(*) FROM contacts WHERE DATE(created_at) = CURRENT_DATE) as new_contacts_today;
```

## 5. Index pour les performances

```sql
-- Index sur les colonnes fréquemment utilisées
CREATE INDEX IF NOT EXISTS idx_messages_contact_id ON messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_mode ON conversations(mode);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
```
