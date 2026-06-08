-- ============================================================================
-- AXA PRISM — SCHEMA INTEGRATION UNIFIED UPGRADES
-- ============================================================================

-- 1. Expand Claim/Audit Status Enum to support 'requires_review'
-- Note: ALTER TYPE ... ADD VALUE cannot be executed inside a multi-statement transaction in some PG configurations.
-- If running into transaction errors, run this line alone first:
ALTER TYPE public.audit_status ADD VALUE IF NOT EXISTS 'requires_review';

-- 2. Setup/Recover prediction_jobs Table
CREATE TABLE IF NOT EXISTS public.prediction_jobs (
  job_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure all columns exist in prediction_jobs if table was already created
ALTER TABLE public.prediction_jobs
  ADD COLUMN IF NOT EXISTS records_processed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS anomaly_detected integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS task_id TEXT,
  ADD COLUMN IF NOT EXISTS triggered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS workflow_stage TEXT DEFAULT 'queued',
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Set default UUID generator for existing primary key if missing
ALTER TABLE public.prediction_jobs ALTER COLUMN job_id SET DEFAULT gen_random_uuid();

-- Enable RLS for prediction_jobs
ALTER TABLE public.prediction_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All authenticated can view prediction_jobs" ON public.prediction_jobs;
CREATE POLICY "All authenticated can view prediction_jobs" 
  ON public.prediction_jobs FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Operators and Admin manage prediction_jobs" ON public.prediction_jobs;
CREATE POLICY "Operators and Admin manage prediction_jobs" 
  ON public.prediction_jobs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('data_operator', 'admin'))
  );

-- Add prediction_jobs check constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_workflow_stage'
    ) THEN
        ALTER TABLE public.prediction_jobs 
          ADD CONSTRAINT check_workflow_stage CHECK (workflow_stage IN ('queued', 'processing', 'calibration_applied', 'completed', 'failed'));
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prediction_jobs_status ON public.prediction_jobs(status);
CREATE INDEX IF NOT EXISTS idx_prediction_jobs_created ON public.prediction_jobs(created_at);

-- 3. Enhance processed_claims
ALTER TABLE public.processed_claims 
  ADD COLUMN IF NOT EXISTS final_risk_score numeric(5,4) DEFAULT 0.0000,
  ADD COLUMN IF NOT EXISTS recommended_action TEXT DEFAULT 'no_action';

CREATE INDEX IF NOT EXISTS idx_processed_claims_risk_score ON public.processed_claims(final_risk_score);

-- 4. Create Strategic Recommendations Table
CREATE TABLE IF NOT EXISTS public.strategic_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  confidence numeric(5,2) DEFAULT 90.00,
  estimated_savings numeric(15,2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'MODIFIED', 'IMPLEMENTED'
  implementation_notes TEXT,
  reasoning TEXT,
  source_claim_id TEXT REFERENCES public.claims(claim_id) ON DELETE SET NULL, -- Aligned to claims.claim_id (TEXT)
  source_prediction_id UUID REFERENCES public.prediction_jobs(job_id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for recommendations
ALTER TABLE public.strategic_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All authenticated can view recommendations" ON public.strategic_recommendations;
CREATE POLICY "All authenticated can view recommendations"
  ON public.strategic_recommendations FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Managers manage recommendations" ON public.strategic_recommendations;
CREATE POLICY "Managers manage recommendations"
  ON public.strategic_recommendations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('strategic_manager', 'admin'))
  );

-- 5. Modify Notifications Table to support recipient target
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Alter table if it existed to ensure columns are present
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS recipient_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS recipient_role TEXT,
  ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Set default UUID generator for notifications id
ALTER TABLE public.notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own or role notifications" ON public.notifications;
CREATE POLICY "Users can view own or role notifications" 
  ON public.notifications FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      recipient_user_id = auth.uid() 
      OR recipient_role = (SELECT role::text FROM public.profiles WHERE id = auth.uid())
      OR (recipient_user_id IS NULL AND recipient_role IS NULL)
    )
  );

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      recipient_user_id = auth.uid()
      OR recipient_role = (SELECT role::text FROM public.profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications" 
  ON public.notifications FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add check constraint for recipient target
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_recipient'
    ) THEN
        ALTER TABLE public.notifications
          ADD CONSTRAINT check_recipient CHECK (recipient_user_id IS NOT NULL OR recipient_role IS NOT NULL OR (recipient_user_id IS NULL AND recipient_role IS NULL));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON public.notifications(recipient_user_id, is_read);

-- 6. Recreate claim_reviews Table (Auditor Collaborative Drafts)
DROP TABLE IF EXISTS public.claim_reviews CASCADE;

CREATE TABLE public.claim_reviews (
  review_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id TEXT REFERENCES public.claims(claim_id) ON DELETE CASCADE UNIQUE, -- Aligned to claims.claim_id (TEXT)
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  suggested_status audit_status NOT NULL DEFAULT 'pending',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for claim_reviews
ALTER TABLE public.claim_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All authenticated can view claim_reviews" ON public.claim_reviews;
CREATE POLICY "All authenticated can view claim_reviews" 
  ON public.claim_reviews FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auditors can manage claim_reviews" ON public.claim_reviews;
CREATE POLICY "Auditors can manage claim_reviews" 
  ON public.claim_reviews FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('medical_auditor', 'admin'))
  );
