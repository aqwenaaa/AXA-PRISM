-- ==========================================
-- 2. INSERT DUMMY DATA ASLI DARI CSV
-- ==========================================

-- Insert Data Polis (Mengambil baris atas dari Data_Polis.csv)
INSERT INTO public.policies (policy_number, plan_code, gender, birth_date, effective_date, domicile)
VALUES 
('POL-0176', 'M-001', 'F', '1981-01-14', '2015-08-28', 'JAKARTA'),
('POL-3288', 'M-002', 'M', '1975-03-05', '2016-10-05', 'SURABAYA'),
('POL-1786', 'M-003', 'M', '1964-08-11', '2014-06-03', 'JAKARTA'),
('POL-0001', 'M-003', 'M', '1971-07-30', '2014-06-03', 'BANDUNG');

-- Insert Data Klaim (Mengambil baris atas dari Data_Klaim.csv)
INSERT INTO public.claims (claim_id, policy_number, claim_type, patient_type, icd_diagnosis, icd_description, payment_date, admission_date, discharge_date, approved_claim_cost, hospital_cost, hospital_location, status)
VALUES 
('C-0001-M', 'POL-0176', 'R', 'OP', 'C50', 'MALIGNANT NEOPLASM OF BREAST', '2024-07-08', '2024-05-27', '2024-05-27', 28093653.00, 6143947.68, 'Singapore', 'pending'),
('C-0002-M', 'POL-3288', 'R', 'OP', 'C34', 'MALIGNANT NEOPLASM OF BRONCHUS AND LUNG', '2024-08-06', '2024-07-15', '2024-07-15', 80987278.00, 82309522.45, 'Malaysia', 'pending'),
('C-0003-M', 'POL-1786', 'R', 'OP', 'C18.9', 'MALIGNANT NEOPLASM, COLON, UNSPECIFIED', '2024-10-17', '2024-05-16', '2024-05-16', 183047130.00, 192859905.00, 'Singapore', 'pending');

-- Insert Data Prediksi AI untuk ditampilkan di Dashboard Analyst
INSERT INTO public.processed_claims (claim_id, expected_claim_cost, residual, anomaly_score, risk_cluster, cf_score)
VALUES 
('C-0001-M', 6500000.00, -356052.32, 0.0500, 1, 0.1500),    -- Risiko Rendah / Normal (Anomaly score kecil)
('C-0002-M', 75000000.00, 7309522.45, 0.4200, 2, 0.6500),   -- Risiko Sedang
('C-0003-M', 100000000.00, 92859905.00, 0.8900, 3, 0.9500); -- Risiko Tinggi / Anomali (Selisih biaya sangat besar)

-- Aktifkan ulang keamanan RLS untuk tabel-tabel ini
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;