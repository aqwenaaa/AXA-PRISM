-- ============================================================================
-- AXA PRISM — SCHEMA INTEGRATION UPGRADES V2.0
-- ============================================================================

-- 1. Recover prediction_jobs Table & Add workflow_stage Tracking with Explicit Enum CHECK
ALTER TABLE public.prediction_jobs 
  ADD COLUMN IF NOT EXISTS records_processed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS anomaly_detected integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS task_id TEXT,
  ADD COLUMN IF NOT EXISTS triggered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS workflow_stage TEXT DEFAULT 'queued';

-- Add constraints carefully in case they already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_workflow_stage'
    ) THEN
        ALTER TABLE public.prediction_jobs 
          ADD CONSTRAINT check_workflow_stage CHECK (workflow_stage IN ('queued', 'processing', 'calibration_applied', 'completed', 'failed'));
    END IF;
END $$;

-- 2. Create Strategic Recommendations Table with Sources (TEXT for source_claim_id)
CREATE TABLE IF NOT EXISTS public.strategic_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  confidence numeric(5,2) DEFAULT 90.00,
  estimated_savings numeric(15,2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED'
  implementation_notes TEXT,
  source_claim_id TEXT REFERENCES public.claims(claim_id) ON DELETE SET NULL, -- Aligned datatype (TEXT)
  source_prediction_id UUID REFERENCES public.prediction_jobs(job_id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for recommendations
ALTER TABLE public.strategic_recommendations ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists then recreate
DROP POLICY IF EXISTS "All authenticated can view recommendations" ON public.strategic_recommendations;
CREATE POLICY "All authenticated can view recommendations"
  ON public.strategic_recommendations FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Managers manage recommendations" ON public.strategic_recommendations;
CREATE POLICY "Managers manage recommendations"
  ON public.strategic_recommendations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('strategic_manager', 'admin'))
  );

-- 3. Modify Notifications Table to Support recipient_user_id & recipient_role
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS recipient_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS recipient_role TEXT,
  ADD COLUMN IF NOT EXISTS action_url TEXT,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Add check constraint for recipient target
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_recipient'
    ) THEN
        ALTER TABLE public.notifications
          ADD CONSTRAINT check_recipient CHECK (recipient_user_id IS NOT NULL OR recipient_role IS NOT NULL);
    END IF;
END $$;
