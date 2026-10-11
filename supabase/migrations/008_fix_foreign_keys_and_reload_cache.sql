-- 1. Ensure conversations -> customers foreign key constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'conversations_customer_id_fkey'
  ) THEN
    ALTER TABLE public.conversations
      ADD CONSTRAINT conversations_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Ensure followups -> customers foreign key constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'followups_customer_id_fkey'
  ) THEN
    ALTER TABLE public.followups
      ADD CONSTRAINT followups_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Ensure notes -> customers foreign key constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notes_customer_id_fkey'
  ) THEN
    ALTER TABLE public.notes
      ADD CONSTRAINT notes_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Ensure activities -> customers foreign key constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activities_customer_id_fkey'
  ) THEN
    ALTER TABLE public.activities
      ADD CONSTRAINT activities_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Force PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';