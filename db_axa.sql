-- ==========================================
-- 0. RESET SKEMA LAMA (Mencegah Error "Already Exists")
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.processed_claims CASCADE;
DROP TABLE IF EXISTS public.data_ingestion_logs CASCADE;
DROP TABLE IF EXISTS public.claims CASCADE;
DROP TABLE IF EXISTS public.policies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS audit_status CASCADE;

-- ==========================================
-- SUPABASE SCHEMA - AXA PRISM (FINAL REVISION)
-- ==========================================

-- 1. PEMBUATAN TIPE DATA CUSTOM (ENUMS)
CREATE TYPE user_role AS ENUM ('data_operator', 'risk_analyst', 'medical_auditor', 'strategic_manager', 'admin');
CREATE TYPE audit_status AS ENUM ('pending', 'valid', 'fraud', 'over_treatment');

-- ==========================================
-- 2. TABEL PROFIL (Terintegrasi Supabase Auth)
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'data_operator',
  avatar_url TEXT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger untuk otomatis memasukkan user baru yang Sign Up ke tabel profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'data_operator');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 3. TABEL DATA MENTAH (Sesuai Dataset Asli)
-- ==========================================
CREATE TABLE public.policies (
  policy_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT UNIQUE, -- ID Unik Nasabah
  age INT NOT NULL,
  sex TEXT NOT NULL,
  bmi DECIMAL NOT NULL,
  children INT NOT NULL,
  smoker BOOLEAN NOT NULL,
  region TEXT NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.claims (
  claim_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID REFERENCES public.policies(policy_id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  diagnosis_code TEXT NOT NULL,
  actual_claim_cost numeric(12,2) NOT NULL,
  status audit_status NOT NULL DEFAULT 'pending',
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 4. TABEL LOG UNGGAHAN (Fitur Track CSV)
-- ==========================================
CREATE TABLE public.data_ingestion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'policies' atau 'claims'
  records_processed integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  error_message TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- ==========================================
-- 5. TABEL HASIL ANALISIS ML (Untuk Risk Analyst)
-- ==========================================
CREATE TABLE public.processed_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES public.claims(claim_id) ON DELETE CASCADE UNIQUE,
  expected_claim_cost numeric(12,2),       -- Hasil Regresi Linear
  residual numeric(12,2),                  -- Selisih actual vs expected
  anomaly_score numeric(5,4),              -- Output Isolation Forest
  risk_cluster INT,                        -- Output K-Means (1=Rendah, 2=Sedang, 3=Tinggi)
  cf_score numeric(5,4),                   -- Nilai Certainty Factor
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- Tabel Pengaturan UI (Slider Risk Analyst)
CREATE TABLE public.system_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL, -- Contoh: 'cf_weights'
  setting_value JSONB NOT NULL,     -- Menyimpan angka/bobot slider
  updated_by UUID REFERENCES public.profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert nilai default slider
INSERT INTO public.system_settings (setting_key, setting_value)
VALUES ('cf_weights', '{"age_weight": 0.2, "bmi_weight": 0.3, "smoker_weight": 0.5}');

-- ==========================================
-- 6. TABEL AUDIT (Untuk Medical Auditor & Manager)
-- ==========================================
CREATE TABLE public.audit_logs (
  audit_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES public.claims(claim_id) ON DELETE CASCADE,
  auditor_id UUID REFERENCES public.profiles(id),
  final_label audit_status NOT NULL, -- Valid, Fraud, Over_treatment
  auditor_notes TEXT,
  retrain_ai_flag BOOLEAN DEFAULT FALSE, -- Trigger AI retraining
  audited_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 7. SECURITY: ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_ingestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies untuk Profiles
CREATE POLICY "All authenticated can view profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies untuk Data Mentah (Policies & Claims)
CREATE POLICY "All authenticated can view policies" ON public.policies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Data operators can insert policies" ON public.policies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('data_operator', 'admin'))
);

CREATE POLICY "All authenticated can view claims" ON public.claims FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Data operators can insert claims" ON public.claims FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('data_operator', 'admin'))
);
CREATE POLICY "Auditors can update claims" ON public.claims FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('medical_auditor', 'admin'))
);

-- Policies untuk Ingestion Logs
CREATE POLICY "All authenticated can view ingestion logs" ON public.data_ingestion_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Data operators manage ingestion logs" ON public.data_ingestion_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('data_operator', 'admin'))
);

-- Policies untuk ML & Settings
CREATE POLICY "All authenticated can view processed claims" ON public.processed_claims FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated can view system settings" ON public.system_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Risk Analysts can update settings" ON public.system_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('risk_analyst', 'admin'))
);

-- Policies untuk Audit
CREATE POLICY "All authenticated can view audit logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auditors can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('medical_auditor', 'admin'))
);

-- ==========================================
-- 8. INDEXES (Optimalisasi Kecepatan Dashboard)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON public.claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_processed_claims_cluster ON public.processed_claims(risk_cluster);
CREATE INDEX IF NOT EXISTS idx_audit_logs_label ON public.audit_logs(final_label);