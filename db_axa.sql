-- Supabase Database Schema for AXA-PRISM Insurance Claim Analysis Platform
-- Run this in Supabase SQL Editor
-- Minimal schema for user metadata and CSV upload storage.

-- Create custom types
CREATE TYPE user_role AS ENUM ('data_operator', 'risk_analyst', 'medical_auditor', 'strategic_manager', 'admin');
CREATE TYPE claim_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'flagged');

-- Profiles table for Supabase Auth metadata
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'data_operator',
  avatar_url TEXT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Policies table for uploaded insurance master data
CREATE TABLE public.policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_number TEXT UNIQUE NOT NULL,
  patient_id TEXT NOT NULL,
  coverage_type TEXT NOT NULL,
  coverage_limit numeric(12,2),
  deductible numeric(10,2),
  effective_date date NOT NULL,
  expiry_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Claims table for uploaded claims transaction data
CREATE TABLE public.claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_number TEXT UNIQUE NOT NULL,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  procedure_code TEXT,
  expected_cost numeric(12,2),
  actual_cost numeric(12,2),
  risk_score numeric(5,4),
  status claim_status NOT NULL DEFAULT 'pending',
  submitted_date date NOT NULL,
  processed_date date,
  auditor_id UUID REFERENCES public.profiles(id),
  audit_notes TEXT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ingestion log table to track file uploads
CREATE TABLE public.data_ingestion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  records_processed integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  error_message TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Enable Row Level Security for application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Profiles can insert own row" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Claims policies
CREATE POLICY "Authenticated users can view claims" ON public.claims
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Data operators can insert claims" ON public.claims
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('data_operator', 'admin')
    )
  );

CREATE POLICY "Auditors can update claims" ON public.claims
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('medical_auditor', 'admin')
    )
  );

-- Policies table policies
CREATE POLICY "Authenticated users can view policies" ON public.policies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Data operators can insert policies" ON public.policies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('data_operator', 'admin')
    )
  );

-- Data ingestion log policies
CREATE POLICY "Data operators can manage ingestion logs" ON public.data_ingestion_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('data_operator', 'admin')
    )
  );

-- Indexes for performance
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_patient_id ON public.claims(patient_id);
CREATE INDEX idx_policies_patient_id ON public.policies(patient_id);
