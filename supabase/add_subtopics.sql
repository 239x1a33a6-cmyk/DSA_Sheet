-- Add parent_id to topics table for subtopic support
ALTER TABLE public.topics 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.topics(id) ON DELETE CASCADE;

-- Update RLS if necessary (it should already be fine as SELECT is open to authenticated)
COMMENT ON COLUMN public.topics.parent_id IS 'References the parent topic if this is a subtopic';
