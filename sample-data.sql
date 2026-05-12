-- Sample data for AXA-PRISM testing
-- Run this AFTER the main schema is created

-- Optional sample profiles (replace ids with real auth user IDs after creating users in Supabase Auth)
-- INSERT INTO public.profiles (id, email, full_name, role) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'operator@axa-prism.com', 'Data Operator', 'data_operator'),
--   ('00000000-0000-0000-0000-000000000002', 'analyst@axa-prism.com', 'Risk Analyst', 'risk_analyst');

-- Insert sample policies
INSERT INTO public.policies (policy_number, patient_id, coverage_type, coverage_limit, deductible, effective_date, expiry_date) VALUES
  ('POL001', 'PAT001', 'Comprehensive Health', 1000000.00, 50000.00, '2024-01-01', '2024-12-31'),
  ('POL002', 'PAT002', 'Basic Health', 500000.00, 25000.00, '2024-01-01', '2024-12-31'),
  ('POL003', 'PAT003', 'Premium Health', 2000000.00, 100000.00, '2024-01-01', '2024-12-31'),
  ('POL004', 'PAT004', 'Comprehensive Health', 1000000.00, 50000.00, '2024-01-01', '2024-12-31'),
  ('POL005', 'PAT005', 'Basic Health', 500000.00, 25000.00, '2024-01-01', '2024-12-31');

-- Insert sample claims
INSERT INTO public.claims (claim_number, patient_id, patient_name, hospital_name, diagnosis, procedure_code, expected_cost, actual_cost, risk_score, status, submitted_date, audit_notes) VALUES
  ('CLM001', 'PAT001', 'Aurelia Wijaya', 'City General Hospital', 'Pneumonia', 'PROC001', 150000.00, 145000.00, 0.1500, 'approved', '2024-01-15', 'Verified standard treatment cost'),
  ('CLM002', 'PAT002', 'Budi Santoso', 'Metro Medical Center', 'Appendicitis', 'PROC002', 200000.00, 280000.00, 0.8500, 'flagged', '2024-01-20', 'Cost above expected range'),
  ('CLM003', 'PAT003', 'Citra Rahma', 'Regional Hospital', 'Fractured Arm', 'PROC003', 75000.00, 72000.00, 0.1200, 'approved', '2024-01-25', 'Normal claim amount'),
  ('CLM004', 'PAT004', 'Dewi Lestari', 'City General Hospital', 'Heart Surgery', 'PROC004', 500000.00, 650000.00, 0.9200, 'under_review', '2024-02-01', 'High-cost procedure requires audit'),
  ('CLM005', 'PAT005', 'Eka Pratama', 'Metro Medical Center', 'Knee Replacement', 'PROC005', 300000.00, 295000.00, 0.0800, 'approved', '2024-02-05', 'Standard surgery claim'),
  ('CLM006', 'PAT001', 'Aurelia Wijaya', 'City General Hospital', 'Diabetes Management', 'PROC006', 50000.00, 120000.00, 0.7800, 'flagged', '2024-02-10', 'Extended treatment period'),
  ('CLM007', 'PAT002', 'Budi Santoso', 'Regional Hospital', 'Hypertension', 'PROC007', 30000.00, 28000.00, 0.0500, 'approved', '2024-02-15', 'Low-risk claim'),
  ('CLM008', 'PAT003', 'Citra Rahma', 'Metro Medical Center', 'Cancer Treatment', 'PROC008', 800000.00, 950000.00, 0.9500, 'under_review', '2024-02-20', 'Requires specialist review');

-- Insert sample ingestion logs
INSERT INTO public.data_ingestion_logs (file_name, file_type, records_processed, records_failed, status, completed_at) VALUES
  ('policies_2024_q1.csv', 'policy', 150, 0, 'completed', '2024-01-01 10:00:00+00'),
  ('claims_2024_q1.csv', 'claims', 200, 1, 'completed', '2024-01-02 11:30:00+00'),
  ('policies_2024_q2.csv', 'policy', 120, 0, 'completed', '2024-04-01 09:15:00+00'),
  ('claims_2024_q2.csv', 'claims', 180, 2, 'completed', '2024-04-02 14:20:00+00');
