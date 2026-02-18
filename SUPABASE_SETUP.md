# Supabase Setup

## 1. Create project
1. Create a Supabase project at https://supabase.com.
2. In `Project Settings -> API`, copy:
   - Project URL
   - `anon` public key

## 2. Configure env
1. Copy `.env.example` to `.env`.
2. Set:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 3. Create database tables and policies
1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql`.

## 4. Auth settings
1. In `Authentication -> Providers`, keep Email enabled.
2. Optional: disable email confirmation for local testing.

## 5. Realtime settings
1. In `Database -> Replication`, enable realtime for:
   - `public.queues`
   - `public.queue_members`

## 6. Run app
```bash
npm install
npm run dev
```

Sign up/login in-app, then create and join queues from different devices. Data is shared through Supabase.
