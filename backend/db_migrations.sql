-- ============================================================================
-- AXA PRISM — SCHEMA INTEGRATION UPGRADES (CTO REVISIONS INCORPORATED)
-- ============================================================================

-- 1. Create prediction_jobs table (Async-Ready Status Tracker)
CREATE TABLE IF NOT EXISTS public.prediction_jobs (
  job_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  records_processed integer DEFAULT 0,
  anomaly_detected integer DEFAULT 0,
  error_message TEXT,
  task_id TEXT, -- Background task tracking ID
  triggered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS for prediction_jobs
ALTER TABLE public.prediction_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view prediction_jobs" 
  ON public.prediction_jobs FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Operators and Admin manage prediction_jobs" 
  ON public.prediction_jobs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('data_operator', 'admin'))
  );

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_prediction_jobs_status ON public.prediction_jobs(status);
CREATE INDEX IF NOT EXISTS idx_prediction_jobs_created ON public.prediction_jobs(created_at);


-- 2. Create notifications table (Dynamic Alert Log)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'user_added', 'system_error', 'model_deployed', 'ingestion_warning', etc.
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means global alert
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or global notifications" 
  ON public.notifications FOR SELECT USING (
    auth.role() = 'authenticated' AND (user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE USING (
    auth.role() = 'authenticated' AND user_id = auth.uid()
  );

CREATE POLICY "Admins can manage all notifications" 
  ON public.notifications FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Composite index to optimize notifications queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);


-- 3. Create claim_reviews table (Auditor Collaborative Drafts)
CREATE TABLE IF NOT EXISTS public.claim_reviews (
  review_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES public.claims(claim_id) ON DELETE CASCADE UNIQUE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  suggested_status audit_status NOT NULL DEFAULT 'pending',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for claim_reviews
ALTER TABLE public.claim_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view claim_reviews" 
  ON public.claim_reviews FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auditors can manage claim_reviews" 
  ON public.claim_reviews FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('medical_auditor', 'admin'))
  );


-- 4. Schema Enhancements on public.processed_claims (CTO Revisions 3 & 4)
ALTER TABLE public.processed_claims 
  ADD COLUMN IF NOT EXISTS final_risk_score numeric(5,4) DEFAULT 0.0000,
  ADD COLUMN IF NOT EXISTS recommended_action TEXT DEFAULT 'no_action';

-- Create performance index on final_risk_score
CREATE INDEX IF NOT EXISTS idx_processed_claims_risk_score ON public.processed_claims(final_risk_score);
