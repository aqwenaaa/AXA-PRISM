#!/usr/bin/env python3
"""Generate AXA_PRISM_Notebook.ipynb — full 15-section prototype."""

import json, os

def md(source: str):
    return {"cell_type": "markdown", "metadata": {}, "source": source}

def code(source: str):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": source,
    }

cells = []

# ─────────────────────────────────────────────────────────────
# BANNER
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""# 🔷 AXA PRISM — Insurance Fraud Intelligence Platform
## Prototype Notebook · Training & Validation Pipeline

---

| Field | Detail |
|---|---|
| **Platform** | AXA PRISM — Hybrid Insurance AI |
| **Type** | Prototype · Training · Validation |
| **Stack** | Python · Scikit-learn · Pandas · Matplotlib |
| **Algorithms** | K-Means · Isolation Forest · Certainty Factor · EDAS |

---

> **Purpose:**  
> This notebook serves as the **training, validation, and prototyping environment** for AXA PRISM.  
> After this notebook is stable, each section will be migrated to a modular FastAPI backend service.  
>
> This is **NOT** the production inference service.  
> The production service lives in the FastAPI `/app/services/` architecture.

---

## Notebook Flow

```
Section 1   →  Project Initialization
Section 2   →  Data Loading
Section 3   →  Data Preprocessing
Section 4   →  Exploratory Data Analysis
Section 5   →  Feature Engineering
Section 6   →  K-Means Customer Segmentation
Section 7   →  Isolation Forest Anomaly Detection
Section 8   →  Certainty Factor Expert System
Section 9   →  Final Risk Score
Section 10  →  EDAS Decision Support System
Section 11  →  Final Recommendation Engine
Section 12  →  Visualization & Reporting
Section 13  →  Save Models
Section 14  →  Supabase Schema Preparation
Section 15  →  FastAPI Transition Plan
```"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 1 — PROJECT INITIALIZATION
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 1 — Project Initialization

**Purpose:** Prepare the notebook environment — imports, configuration, logging, reproducibility seed.

**Libraries used:**
`pandas` · `numpy` · `matplotlib` · `seaborn` · `scikit-learn` · `joblib` · `uuid` · `scipy`"""
))

cells.append(code(
"""# ─── Standard Library ───────────────────────────────────────────────────────
import os
import uuid as uuid_lib
import warnings
import logging
from datetime import datetime

# ─── Data & Numerics ────────────────────────────────────────────────────────
import numpy as np
import pandas as pd

# ─── Visualisation ──────────────────────────────────────────────────────────
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns

# ─── Machine Learning ───────────────────────────────────────────────────────
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
import joblib

# ─── Configuration ──────────────────────────────────────────────────────────
warnings.filterwarnings('ignore')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger('AXA_PRISM')

np.random.seed(42)
pd.set_option('display.max_columns', 30)
pd.set_option('display.float_format', '{:,.2f}'.format)

sns.set_theme(style='whitegrid', palette='muted', font_scale=1.1)
plt.rcParams.update({'figure.dpi': 100, 'figure.figsize': (12, 5)})

# ─── Directory Setup ────────────────────────────────────────────────────────
DATA_POLIS_PATH  = 'Data_Polis.csv'
DATA_KLAIM_PATH  = 'Data_Klaim.csv'
MODEL_DIR        = 'saved_models'
OUTPUT_DIR       = 'outputs'

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

logger.info("AXA PRISM — Environment initialised successfully")
logger.info(f"Numpy  : {np.__version__}")
logger.info(f"Pandas : {pd.__version__}")
logger.info(f"Models → {MODEL_DIR}/   |   Outputs → {OUTPUT_DIR}/")"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 2 — DATA LOADING
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 2 — Data Loading

**Purpose:** Load `Data_Polis.csv` and `Data_Klaim.csv`, inspect schemas, and produce the joined `merged_df`.

**Key join:** `Nomor Polis` (left-join claims onto policies)."""
))

cells.append(code(
"""logger.info("Loading datasets …")

polis_df = pd.read_csv(DATA_POLIS_PATH)
klaim_df  = pd.read_csv(DATA_KLAIM_PATH)

logger.info(f"Polis  : {polis_df.shape[0]:,} rows  ×  {polis_df.shape[1]} cols")
logger.info(f"Klaim  : {klaim_df.shape[0]:,} rows  ×  {klaim_df.shape[1]} cols")

print("\\n═══════ Data_Polis — first 3 rows ═══════")
display(polis_df.head(3))

print("\\n═══════ Data_Klaim — first 3 rows ═══════")
display(klaim_df.head(3))"""
))

cells.append(code(
"""# ─── Schema Inspection ───────────────────────────────────────────────────────
print("── Polis dtypes & missing values ──")
polis_info = pd.DataFrame({
    'dtype'  : polis_df.dtypes.astype(str),
    'nulls'  : polis_df.isnull().sum(),
    'unique' : polis_df.nunique()
})
display(polis_info)

print("\\n── Klaim dtypes & missing values ──")
klaim_info = pd.DataFrame({
    'dtype'  : klaim_df.dtypes.astype(str),
    'nulls'  : klaim_df.isnull().sum(),
    'unique' : klaim_df.nunique()
})
display(klaim_info)"""
))

cells.append(code(
"""# ─── Merge Datasets ─────────────────────────────────────────────────────────
merged_df = klaim_df.merge(polis_df, on='Nomor Polis', how='left')

matched   = merged_df['Plan Code'].notna().sum()
unmatched = merged_df['Plan Code'].isna().sum()

logger.info(f"Merged shape   : {merged_df.shape}")
logger.info(f"Matched claims : {matched:,}")
logger.info(f"Unmatched      : {unmatched:,}  (policies not in polis table)")
logger.info(f"Unique policies in claims: {merged_df['Nomor Polis'].nunique():,}")

display(merged_df.head(3))"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 3 — PREPROCESSING
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 3 — Data Preprocessing

**Purpose:** Clean and stabilise the raw merged dataset for modelling.

**Tasks:**
- Date parsing (integer `YYYYMMDD` and string `M/D/YYYY`)
- Missing-value imputation
- Duplicate removal
- Derived temporal columns (`usia_nasabah`, `policy_age_days`, `length_of_stay`)
- Label encoding for categorical variables
- StandardScaler for model-ready features

**Artefacts saved:** `scaler.pkl`, `label_encoders.pkl`"""
))

cells.append(code(
"""# ─── Date Parsing Helpers ───────────────────────────────────────────────────
def parse_integer_date(series: pd.Series) -> pd.Series:
    \"\"\"Parse integer YYYYMMDD → datetime.\"\"\"
    return pd.to_datetime(series.astype(str), format='%Y%m%d', errors='coerce')

def parse_string_date(series: pd.Series) -> pd.Series:
    \"\"\"Parse string M/D/YYYY → datetime.\"\"\"
    return pd.to_datetime(series, format='%m/%d/%Y', errors='coerce')

# ─── Working Copy ────────────────────────────────────────────────────────────
df = merged_df.copy()

# Parse dates
df['tanggal_lahir']    = parse_integer_date(df['Tanggal Lahir'])
df['tanggal_efektif']  = parse_integer_date(df['Tanggal Efektif Polis'])
df['tanggal_masuk']    = parse_string_date(df['Tanggal Pasien Masuk RS'])
df['tanggal_keluar']   = parse_string_date(df['Tanggal Pasien Keluar RS'])
df['tanggal_bayar']    = parse_string_date(df['Tanggal Pembayaran Klaim'])

logger.info("Date columns parsed")"""
))

cells.append(code(
"""# ─── Missing Value Imputation ───────────────────────────────────────────────
df['Inpatient/Outpatient'].fillna('UNKNOWN', inplace=True)
df['ICD Diagnosis'].fillna('UNKNOWN', inplace=True)
df['ICD Description'].fillna('UNKNOWN', inplace=True)
df['Lokasi RS'].fillna('Indonesia', inplace=True)
# For missing payment date, approximate with admission date
df['tanggal_bayar'].fillna(df['tanggal_masuk'], inplace=True)

print("Missing values after imputation:")
remaining = df.isnull().sum()
display(remaining[remaining > 0].to_frame('remaining_nulls'))"""
))

cells.append(code(
"""# ─── Duplicate Removal ──────────────────────────────────────────────────────
before = len(df)
df = df.drop_duplicates(subset=['Claim ID'])
after  = len(df)
logger.info(f"Duplicates removed: {before - after:,}  |  Records: {after:,}")

# ─── Derived Temporal Features ──────────────────────────────────────────────
REF_DATE = pd.Timestamp('2025-01-01')

df['usia_nasabah']   = ((REF_DATE - df['tanggal_lahir']).dt.days / 365.25).round(1)
df['policy_age_days'] = (df['tanggal_masuk'] - df['tanggal_efektif']).dt.days.clip(lower=0)
df['length_of_stay']  = (df['tanggal_keluar'] - df['tanggal_masuk']).dt.days.clip(lower=0)

print(f"Usia nasabah   — min: {df['usia_nasabah'].min():.0f}  max: {df['usia_nasabah'].max():.0f}  mean: {df['usia_nasabah'].mean():.1f}")
print(f"Policy age     — min: {df['policy_age_days'].min():.0f}  max: {df['policy_age_days'].max():.0f}  mean: {df['policy_age_days'].mean():.0f}")
print(f"Length of stay — min: {df['length_of_stay'].min():.0f}  max: {df['length_of_stay'].max():.0f}  mean: {df['length_of_stay'].mean():.2f}")"""
))

cells.append(code(
"""# ─── Encoding ───────────────────────────────────────────────────────────────
label_encoders = {}

CATEGORICAL_COLS = ['Gender', 'Reimburse/Cashless', 'Inpatient/Outpatient', 'Domisili', 'Lokasi RS']

for col in CATEGORICAL_COLS:
    le = LabelEncoder()
    df[f'{col}_enc'] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le

# Plan Code ordinal: M-001=1, M-002=2, M-003=3
PLAN_MAP = {'M-001': 1, 'M-002': 2, 'M-003': 3}
df['plan_code_num'] = df['Plan Code'].map(PLAN_MAP).fillna(2).astype(int)

# Convenience binaries
df['is_cashless']  = (df['Reimburse/Cashless'] == 'C').astype(int)
df['is_inpatient'] = (df['Inpatient/Outpatient'] == 'IP').astype(int)
df['is_overseas']  = (df['Lokasi RS'] != 'Indonesia').astype(int)

logger.info("Encoding complete")
print("Encoding summary:")
for col in CATEGORICAL_COLS:
    print(f"  {col:30s} → {len(label_encoders[col].classes_)} classes")"""
))

cells.append(code(
"""# ─── Feature Matrix & Scaling ───────────────────────────────────────────────
BASE_NUMERIC_FEATURES = [
    'Nominal Klaim Yang Disetujui', 'Nominal Biaya RS Yang Terjadi',
    'usia_nasabah', 'policy_age_days', 'length_of_stay',
    'plan_code_num', 'is_cashless', 'is_inpatient', 'is_overseas'
]

X_base = df[BASE_NUMERIC_FEATURES].fillna(0)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_base)

logger.info(f"Scaled feature matrix shape: {X_scaled.shape}")
print(f"\\nPreprocessing complete  →  {df.shape[0]:,} rows · {df.shape[1]} columns")"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 4 — EDA
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 4 — Exploratory Data Analysis

**Purpose:** Understand claim distributions, customer demographics, and initial fraud patterns.

**Analyses:**
- Univariate: claim amount, age, plan, location, care type
- Bivariate: claim amount by plan code and location
- Correlation heatmap
- Domisili-level claim concentration"""
))

cells.append(code(
"""# ─── Overview Dashboard ─────────────────────────────────────────────────────
fig, axes = plt.subplots(2, 3, figsize=(18, 10))
fig.suptitle('AXA PRISM — Exploratory Data Analysis Overview', fontsize=15, fontweight='bold', y=1.01)

# 1. Claim amount histogram
axes[0, 0].hist(
    df['Nominal Klaim Yang Disetujui'].dropna() / 1e6,
    bins=60, color='#2980b9', alpha=0.8, edgecolor='white', linewidth=0.4
)
axes[0, 0].set_title('Distribusi Nominal Klaim')
axes[0, 0].set_xlabel('Nominal Klaim (Juta IDR)')
axes[0, 0].set_ylabel('Frekuensi')

# 2. Plan Code bar
plan_counts = df['Plan Code'].value_counts()
axes[0, 1].bar(plan_counts.index, plan_counts.values,
               color=['#3498db', '#e67e22', '#2ecc71'], edgecolor='white')
axes[0, 1].set_title('Distribusi Plan Code')
axes[0, 1].set_xlabel('Plan Code')
axes[0, 1].set_ylabel('Jumlah Klaim')
for bar, val in zip(axes[0, 1].patches, plan_counts.values):
    axes[0, 1].text(bar.get_x() + bar.get_width()/2, bar.get_height() + 10,
                    f'{val:,}', ha='center', fontsize=9)

# 3. Lokasi RS horizontal bar
loc_counts = df['Lokasi RS'].value_counts().head(7)
axes[0, 2].barh(loc_counts.index, loc_counts.values, color='#e74c3c', alpha=0.8)
axes[0, 2].set_title('Distribusi Lokasi RS')
axes[0, 2].set_xlabel('Jumlah Klaim')

# 4. Inpatient/Outpatient pie
ip_counts = df['Inpatient/Outpatient'].value_counts()
axes[1, 0].pie(ip_counts.values, labels=ip_counts.index, autopct='%1.1f%%',
               startangle=90, colors=['#3498db', '#e67e22', '#2ecc71', '#9b59b6'])
axes[1, 0].set_title('Tipe Klaim')

# 5. Usia nasabah histogram
axes[1, 1].hist(df['usia_nasabah'].dropna(), bins=30,
               color='#27ae60', alpha=0.8, edgecolor='white', linewidth=0.4)
axes[1, 1].set_title('Distribusi Usia Nasabah')
axes[1, 1].set_xlabel('Usia (tahun)')
axes[1, 1].set_ylabel('Frekuensi')

# 6. Reimburse vs Cashless pie
rc_counts = df['Reimburse/Cashless'].value_counts()
axes[1, 2].pie(rc_counts.values, labels=['Reimburse', 'Cashless'],
               autopct='%1.1f%%', colors=['#5B9BD5', '#ED7D31'], startangle=90)
axes[1, 2].set_title('Reimburse vs Cashless')

plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/eda_overview.png', bbox_inches='tight', dpi=150)
plt.show()
logger.info("EDA overview chart saved")"""
))

cells.append(code(
"""# ─── Bivariate Analysis ─────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(15, 5))

# Claim by Plan Code boxplot
plan_data = [
    df[df['Plan Code'] == p]['Nominal Klaim Yang Disetujui'].dropna() / 1e6
    for p in ['M-001', 'M-002', 'M-003']
]
bp1 = axes[0].boxplot(plan_data, labels=['M-001\\n(Basic)', 'M-002\\n(Standard)', 'M-003\\n(Premium)'],
                      patch_artist=True, notch=False)
for patch, color in zip(bp1['boxes'], ['#3498db', '#e67e22', '#2ecc71']):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)
axes[0].set_title('Nominal Klaim per Plan Code')
axes[0].set_ylabel('Nominal Klaim (Juta IDR)')

# Claim by Location boxplot
top_locs = ['Indonesia', 'Singapore', 'Malaysia']
loc_data  = [df[df['Lokasi RS'] == l]['Nominal Klaim Yang Disetujui'].dropna() / 1e6 for l in top_locs]
bp2 = axes[1].boxplot(loc_data, labels=top_locs, patch_artist=True, notch=False)
for patch, color in zip(bp2['boxes'], ['#3498db', '#e67e22', '#e74c3c']):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)
axes[1].set_title('Nominal Klaim per Lokasi RS')
axes[1].set_ylabel('Nominal Klaim (Juta IDR)')

plt.suptitle('Bivariate Analysis — Claim Amount Distribution', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/eda_bivariate.png', bbox_inches='tight', dpi=150)
plt.show()"""
))

cells.append(code(
"""# ─── Correlation Heatmap ────────────────────────────────────────────────────
numeric_eda = [
    'Nominal Klaim Yang Disetujui', 'Nominal Biaya RS Yang Terjadi',
    'usia_nasabah', 'policy_age_days', 'length_of_stay',
    'plan_code_num', 'is_cashless', 'is_inpatient', 'is_overseas'
]

corr_df   = df[numeric_eda].corr()
mask_upper = np.triu(np.ones_like(corr_df, dtype=bool))

plt.figure(figsize=(11, 8))
sns.heatmap(
    corr_df, annot=True, fmt='.2f', cmap='coolwarm',
    center=0, mask=mask_upper, square=True,
    linewidths=0.5, cbar_kws={'shrink': 0.8}
)
plt.title('Correlation Matrix — AXA PRISM Features', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/eda_correlation.png', bbox_inches='tight', dpi=150)
plt.show()"""
))

cells.append(code(
"""# ─── Domisili Claim Concentration ──────────────────────────────────────────
domisili_stats = (
    df.groupby('Domisili')['Nominal Klaim Yang Disetujui']
    .agg(count='count', total='sum', mean='mean')
    .sort_values('total', ascending=False)
    .head(12)
    .reset_index()
)

fig, ax = plt.subplots(figsize=(13, 5))
bars = ax.barh(domisili_stats['Domisili'], domisili_stats['total'] / 1e9,
               color='#2980b9', alpha=0.85)
ax.set_xlabel('Total Klaim (Miliar IDR)')
ax.set_title('Top 12 Domisili — Total Nilai Klaim', fontsize=13, fontweight='bold')
ax.bar_label(bars, labels=[f'  {v:.1f}B' for v in domisili_stats['total'] / 1e9], padding=2, fontsize=9)
plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/eda_domisili.png', bbox_inches='tight', dpi=150)
plt.show()

logger.info("EDA complete — 4 visualisations saved")

print("\\n── Key Business Insights ──────────────────────────────────────────────")
print(f"  Total claims             : {len(df):,}")
print(f"  Total claim value        : IDR {df['Nominal Klaim Yang Disetujui'].sum():,.0f}")
print(f"  Overseas claims          : {df['is_overseas'].sum():,}  ({df['is_overseas'].mean()*100:.1f}%)")
print(f"  Avg claim severity       : IDR {df['Nominal Klaim Yang Disetujui'].mean():,.0f}")
print(f"  Median claim severity    : IDR {df['Nominal Klaim Yang Disetujui'].median():,.0f}")
print(f"  Inpatient proportion     : {df['is_inpatient'].mean()*100:.1f}%")"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 5 — FEATURE ENGINEERING
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 5 — Feature Engineering

**Purpose:** Construct interpretable, business-oriented features for ML models and the expert system.

### Features Built

| Category | Feature | Logic |
|---|---|---|
| **Financial** | `claim_severity` | Approved claim amount |
| **Financial** | `residual_cost` | Hospital cost − approved amount |
| **Financial** | `claim_to_expected_ratio` | Claim / plan median benchmark |
| **Financial** | `actual_vs_expected_diff` | Absolute gap from plan benchmark |
| **Behavioral** | `claim_frequency` | Claims per policy |
| **Behavioral** | `claim_velocity` | Claims per policy-month |
| **Behavioral** | `repeated_claim_indicator` | Binary: > 1 claim |
| **Behavioral** | `policy_age` | Days from effective to admission |
| **Fraud** | `high_risk_region_indicator` | 1 = overseas hospital |
| **Fraud** | `suspicious_claim_frequency` | 1 = above 75th-percentile frequency |
| **Fraud** | `unusual_claim_pattern` | 1 = above 90th-percentile severity |"""
))

cells.append(code(
"""# ─── Expected Cost Benchmark by Plan Code ───────────────────────────────────
plan_expected_cost = df.groupby('Plan Code')['Nominal Klaim Yang Disetujui'].median()
logger.info("Plan benchmark (median claim):")
for plan, val in plan_expected_cost.items():
    logger.info(f"  {plan}: IDR {val:,.0f}")

feature_df = df.copy()
feature_df['expected_claim_cost'] = feature_df['Plan Code'].map(plan_expected_cost)"""
))

cells.append(code(
"""# ─── Claim-Level Financial Features ────────────────────────────────────────
feature_df['claim_severity'] = feature_df['Nominal Klaim Yang Disetujui'].fillna(0)

feature_df['residual_cost'] = (
    feature_df['Nominal Biaya RS Yang Terjadi'] - feature_df['Nominal Klaim Yang Disetujui']
).clip(lower=0).fillna(0)

feature_df['claim_to_expected_ratio'] = (
    feature_df['claim_severity'] /
    feature_df['expected_claim_cost'].replace(0, np.nan)
).fillna(1.0)

feature_df['actual_vs_expected_diff'] = (
    feature_df['Nominal Biaya RS Yang Terjadi'] - feature_df['expected_claim_cost']
).abs().fillna(0)

logger.info("Financial features created")"""
))

cells.append(code(
"""# ─── Policy-Level Behavioural Aggregation ───────────────────────────────────
policy_agg = df.groupby('Nomor Polis').agg(
    claim_frequency    = ('Claim ID',                       'count'),
    total_claim_amount = ('Nominal Klaim Yang Disetujui',   'sum'),
    mean_claim_severity= ('Nominal Klaim Yang Disetujui',   'mean'),
    max_policy_age     = ('policy_age_days',                'max'),
    overseas_count     = ('is_overseas',                    'sum'),
).reset_index()

policy_agg['repeated_claim_indicator'] = (policy_agg['claim_frequency'] > 1).astype(int)
policy_agg['policy_age']               = policy_agg['max_policy_age'].clip(lower=1)

# Claim velocity = claims per month of policy age
policy_agg['claim_velocity'] = (
    policy_agg['claim_frequency'] / (policy_agg['policy_age'] / 30.44)
).round(4)

# High-risk region ratio (overseas claims / total)
policy_agg['high_risk_region_ratio'] = (
    policy_agg['overseas_count'] / policy_agg['claim_frequency']
).fillna(0)

# Merge back to claim level
feature_df = feature_df.merge(
    policy_agg[['Nomor Polis', 'claim_frequency', 'claim_velocity',
                 'repeated_claim_indicator', 'policy_age', 'high_risk_region_ratio']],
    on='Nomor Polis', how='left'
)

logger.info(f"Policy-level features merged | unique policies: {policy_agg.shape[0]:,}")"""
))

cells.append(code(
"""# ─── Fraud Indicator Flags ───────────────────────────────────────────────────
freq_threshold     = feature_df['claim_frequency'].quantile(0.75)
severity_threshold = feature_df['claim_severity'].quantile(0.90)

feature_df['suspicious_claim_frequency'] = (feature_df['claim_frequency'] > freq_threshold).astype(int)
feature_df['high_risk_region_indicator'] = feature_df['is_overseas'].astype(int)
feature_df['unusual_claim_pattern']      = (feature_df['claim_severity'] > severity_threshold).astype(int)

logger.info(f"Suspicious freq flag (>{freq_threshold:.0f} claims)    : {feature_df['suspicious_claim_frequency'].sum():,} claims")
logger.info(f"High risk region flag                                   : {feature_df['high_risk_region_indicator'].sum():,} claims")
logger.info(f"Unusual severity flag (>{severity_threshold/1e6:.0f}M IDR): {feature_df['unusual_claim_pattern'].sum():,} claims")"""
))

cells.append(code(
"""# ─── Final Model Feature Matrix ─────────────────────────────────────────────
MODEL_FEATURES = [
    # Financial
    'claim_severity', 'residual_cost', 'claim_to_expected_ratio', 'actual_vs_expected_diff',
    # Behavioral
    'claim_frequency', 'claim_velocity', 'repeated_claim_indicator', 'policy_age_days',
    # Fraud
    'high_risk_region_indicator', 'suspicious_claim_frequency', 'unusual_claim_pattern',
    # Clinical
    'is_cashless', 'is_inpatient', 'length_of_stay'
]

feature_df[MODEL_FEATURES] = feature_df[MODEL_FEATURES].fillna(0)

feature_scaler = StandardScaler()
X_model_scaled  = feature_scaler.fit_transform(feature_df[MODEL_FEATURES])
X_model_df      = pd.DataFrame(X_model_scaled, columns=MODEL_FEATURES)

logger.info(f"Model feature matrix: {X_model_df.shape}")

print("\\nFeature Engineering Summary:")
display(feature_df[MODEL_FEATURES].describe().round(3))"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 6 — K-MEANS
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 6 — K-Means Customer Risk Segmentation

**Purpose:** Segment policyholders into risk groups based on behavioural and financial patterns.

**Algorithm:** K-Means (with Silhouette scoring for optimal K)

**Operates at:** Policy level (one row per `Nomor Polis`)

**Output:** `risk_cluster` label per policy — `Low Risk`, `Medium Risk`, `High Risk`"""
))

cells.append(code(
"""# ─── Policy-Level Cluster Features ─────────────────────────────────────────
CLUSTER_FEATURES = [
    'claim_frequency', 'claim_velocity', 'mean_claim_severity',
    'repeated_claim_indicator', 'policy_age', 'high_risk_region_ratio'
]

for col in CLUSTER_FEATURES:
    if col not in policy_agg.columns:
        policy_agg[col] = 0

policy_cluster_df = policy_agg[['Nomor Polis'] + CLUSTER_FEATURES].fillna(0).copy()

cluster_scaler     = StandardScaler()
X_cluster_scaled   = cluster_scaler.fit_transform(policy_cluster_df[CLUSTER_FEATURES])

logger.info(f"Cluster matrix: {X_cluster_scaled.shape}  (one row per policy)")"""
))

cells.append(code(
"""# ─── Optimal K — Silhouette Method ──────────────────────────────────────────
K_RANGE          = range(2, 9)
silhouette_scores = []

for k in K_RANGE:
    km   = KMeans(n_clusters=k, random_state=42, n_init=10)
    lbl  = km.fit_predict(X_cluster_scaled)
    sil  = silhouette_score(X_cluster_scaled, lbl)
    silhouette_scores.append(sil)
    logger.info(f"  K={k}  silhouette={sil:.4f}")

best_k = list(K_RANGE)[int(np.argmax(silhouette_scores))]
best_k = max(best_k, 3)   # enforce minimum 3 for Low/Medium/High labelling

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(list(K_RANGE), silhouette_scores, 'o-', color='steelblue', linewidth=2, markersize=7)
ax.axvline(x=best_k, color='#e74c3c', linestyle='--', linewidth=1.5, label=f'Best K = {best_k}')
ax.fill_between(list(K_RANGE), silhouette_scores, alpha=0.1, color='steelblue')
ax.set_xlabel('Number of Clusters (K)')
ax.set_ylabel('Silhouette Score')
ax.set_title('K-Means — Optimal K Selection via Silhouette Method', fontsize=12, fontweight='bold')
ax.legend()
plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/kmeans_silhouette.png', bbox_inches='tight', dpi=150)
plt.show()

logger.info(f"Best K selected: {best_k}  (silhouette={max(silhouette_scores):.4f})")"""
))

cells.append(code(
"""# ─── Fit Final K-Means ───────────────────────────────────────────────────────
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10, max_iter=300)
cluster_raw = kmeans.fit_predict(X_cluster_scaled)
policy_cluster_df['cluster_raw'] = cluster_raw

# Rank clusters by mean claim severity (low → high)
severity_rank = (
    policy_cluster_df.groupby('cluster_raw')['mean_claim_severity']
    .mean()
    .sort_values()
    .reset_index()
)
severity_rank['rank'] = range(len(severity_rank))
rank_map = dict(zip(severity_rank['cluster_raw'], severity_rank['rank']))
policy_cluster_df['cluster_ranked'] = policy_cluster_df['cluster_raw'].map(rank_map)

# Build risk label map
def build_risk_label(rank: int, n: int) -> str:
    if rank == 0:
        return 'Low Risk'
    elif rank == n - 1:
        return 'High Risk'
    else:
        return f'Medium Risk' if n == 3 else f'Medium Risk {rank}'

RISK_LABEL_MAP = {i: build_risk_label(i, best_k) for i in range(best_k)}
policy_cluster_df['risk_cluster']     = policy_cluster_df['cluster_ranked'].map(RISK_LABEL_MAP)
policy_cluster_df['risk_cluster_num'] = policy_cluster_df['cluster_ranked']

logger.info("K-Means fitted:")
for label in policy_cluster_df['risk_cluster'].value_counts().items():
    logger.info(f"  {label[0]:20s}: {label[1]:,} policies")"""
))

cells.append(code(
"""# ─── PCA Projection Visualisation ───────────────────────────────────────────
pca = PCA(n_components=2, random_state=42)
X_pca = pca.fit_transform(X_cluster_scaled)

CLUSTER_COLORS = ['#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#3498db']

fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# Scatter
for i, label in RISK_LABEL_MAP.items():
    mask = (policy_cluster_df['cluster_ranked'] == i).values
    axes[0].scatter(X_pca[mask, 0], X_pca[mask, 1],
                    c=CLUSTER_COLORS[i], label=label,
                    alpha=0.55, s=35, edgecolors='white', linewidth=0.3)
axes[0].set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% variance)')
axes[0].set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% variance)')
axes[0].set_title('K-Means Customer Risk Segmentation\\n(PCA 2D Projection)', fontsize=11, fontweight='bold')
axes[0].legend(loc='upper right')

# Cluster distribution bar
cluster_dist = policy_cluster_df['risk_cluster'].value_counts()
axes[1].bar(cluster_dist.index, cluster_dist.values,
            color=[CLUSTER_COLORS[RISK_LABEL_MAP[k]] for k in range(best_k)
                   if RISK_LABEL_MAP[k] in cluster_dist.index][:len(cluster_dist)])
axes[1].set_title('Cluster Size Distribution', fontsize=11, fontweight='bold')
axes[1].set_ylabel('Number of Policies')
axes[1].tick_params(axis='x', rotation=15)

plt.suptitle('AXA PRISM — K-Means Segmentation Results', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/kmeans_clusters.png', bbox_inches='tight', dpi=150)
plt.show()

print("\\nCluster Profile (mean features):")
display(policy_cluster_df.groupby('risk_cluster')[CLUSTER_FEATURES].mean().round(3))"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 7 — ISOLATION FOREST
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 7 — Isolation Forest Anomaly Detection

**Purpose:** Flag statistically anomalous claims as potential fraud candidates.

**Algorithm:** Isolation Forest (contamination = 5%)

**Operates at:** Claim level

**Output:**
- `anomaly_score` — normalised [0, 1] (1 = most anomalous)
- `anomaly_label` — `Normal` / `Suspicious`"""
))

cells.append(code(
"""# ─── Isolation Forest Feature Matrix ────────────────────────────────────────
ISO_FEATURES = [
    'claim_severity', 'residual_cost', 'claim_to_expected_ratio',
    'actual_vs_expected_diff', 'claim_frequency', 'claim_velocity',
    'high_risk_region_indicator', 'length_of_stay',
    'suspicious_claim_frequency', 'unusual_claim_pattern'
]

X_iso      = feature_df[ISO_FEATURES].fillna(0).values
iso_scaler = StandardScaler()
X_iso_sc   = iso_scaler.fit_transform(X_iso)

# ─── Train ───────────────────────────────────────────────────────────────────
iso_forest = IsolationForest(
    n_estimators  = 100,
    contamination = 0.05,   # 5 % contamination assumption
    random_state  = 42,
    max_features  = 1.0,
    max_samples   = 'auto'
)
iso_forest.fit(X_iso_sc)

# ─── Score & Normalise ───────────────────────────────────────────────────────
raw_scores         = iso_forest.score_samples(X_iso_sc)   # lower → more anomalous
score_normaliser   = MinMaxScaler()
anomaly_scores     = score_normaliser.fit_transform(
    (-raw_scores).reshape(-1, 1)
).flatten()

iso_preds          = iso_forest.predict(X_iso_sc)          # -1 = anomaly, +1 = normal

feature_df['anomaly_score']  = anomaly_scores.round(4)
feature_df['anomaly_label']  = np.where(iso_preds == -1, 'Suspicious', 'Normal')
feature_df['anomaly_binary'] = (iso_preds == -1).astype(int)

n_sus  = feature_df['anomaly_binary'].sum()
logger.info(f"Anomalies detected : {n_sus:,}  ({n_sus/len(feature_df)*100:.1f}%)")
logger.info(f"Anomaly score — min: {anomaly_scores.min():.4f}  max: {anomaly_scores.max():.4f}  mean: {anomaly_scores.mean():.4f}")"""
))

cells.append(code(
"""# ─── Visualisation ───────────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(15, 5))

# Score histogram
threshold = feature_df.loc[feature_df['anomaly_label'] == 'Suspicious', 'anomaly_score'].min()
axes[0].hist(feature_df['anomaly_score'], bins=60, color='#3498db', alpha=0.8, edgecolor='white', linewidth=0.3)
axes[0].axvline(x=threshold, color='#e74c3c', linestyle='--', linewidth=1.8,
                label=f'Suspicious threshold: {threshold:.3f}')
axes[0].set_xlabel('Anomaly Score')
axes[0].set_ylabel('Frekuensi')
axes[0].set_title('Distribusi Anomaly Score')
axes[0].legend()

# Scatter: claim severity vs residual cost
colors_sc = ['#2ecc71' if l == 'Normal' else '#e74c3c' for l in feature_df['anomaly_label']]
axes[1].scatter(
    feature_df['claim_severity'] / 1e6,
    feature_df['residual_cost'] / 1e6,
    c=colors_sc, alpha=0.45, s=12
)
axes[1].set_xlabel('Claim Severity (Juta IDR)')
axes[1].set_ylabel('Residual Cost (Juta IDR)')
axes[1].set_title('Claim Severity vs Residual Cost')
normal_p     = mpatches.Patch(color='#2ecc71', label=f'Normal ({(~feature_df["anomaly_binary"].astype(bool)).sum():,})')
suspicious_p = mpatches.Patch(color='#e74c3c', label=f'Suspicious ({n_sus:,})')
axes[1].legend(handles=[normal_p, suspicious_p])

plt.suptitle('Isolation Forest — Anomaly Detection Results', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/anomaly_detection.png', bbox_inches='tight', dpi=150)
plt.show()"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 8 — CERTAINTY FACTOR EXPERT SYSTEM
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 8 — Certainty Factor Expert System

**Purpose:** Augment the ML anomaly signal with expert-driven reasoning — the **core identity** of AXA PRISM.

### Conceptual Background

The Certainty Factor (CF) framework was introduced in the MYCIN medical expert system.  
It quantifies how much a piece of evidence increases or decreases belief in a hypothesis.

### Formulas

**CF for a single rule:**
$$CF(H, E) = MB(H, E) - MD(H, E)$$

Where:
- $MB$ = Measure of Belief (0–1): how much the evidence supports the hypothesis
- $MD$ = Measure of Disbelief (0–1): how much the evidence contradicts the hypothesis

**Sequential combination (two rules):**
$$CF_{combine} = CF_1 + CF_2 \\times (1 - CF_1) \\quad \\text{(if both positive)}$$

### Expert Variables

| Variable | Source |
|---|---|
| `cf_anomaly` | Isolation Forest anomaly score |
| `cf_location` | Overseas hospital claim |
| `cf_severity` | Normalised claim amount |
| `cf_behavioral` | Frequency + velocity + repeat |
| `cf_residual` | Phantom-billing residual cost |"""
))

cells.append(code(
"""# ─── CF Core Functions ───────────────────────────────────────────────────────

def measure_of_belief(evidence: float,
                      high_thresh: float = 0.70,
                      med_thresh:  float = 0.40) -> float:
    \"\"\"
    MB(H, E) — Measure of Belief.

    Returns how strongly the evidence supports the fraud hypothesis.
    Three-tier step function calibrated for insurance fraud domain.
    \"\"\"
    if evidence >= high_thresh:
        return 0.80
    elif evidence >= med_thresh:
        return 0.50
    else:
        return 0.20


def measure_of_disbelief(evidence: float,
                         high_thresh: float = 0.70,
                         med_thresh:  float = 0.40) -> float:
    \"\"\"
    MD(H, E) — Measure of Disbelief.

    Returns how strongly the evidence contradicts the fraud hypothesis.
    Inversely calibrated: high evidence → low disbelief.
    \"\"\"
    if evidence >= high_thresh:
        return 0.10
    elif evidence >= med_thresh:
        return 0.25
    else:
        return 0.50


def cf_single(evidence: float,
              high_thresh: float = 0.70,
              med_thresh:  float = 0.40) -> float:
    \"\"\"CF(H, E) = MB(H, E) − MD(H, E)\"\"\"
    mb = measure_of_belief(evidence, high_thresh, med_thresh)
    md = measure_of_disbelief(evidence, high_thresh, med_thresh)
    return round(mb - md, 4)


def combine_cf(cf1: float, cf2: float) -> float:
    \"\"\"
    Sequential CF combination:
      both positive  →  cf1 + cf2*(1 − cf1)
      both negative  →  cf1 + cf2*(1 + cf1)
      mixed sign     →  (cf1 + cf2) / (1 − min(|cf1|, |cf2|))
    \"\"\"
    if cf1 >= 0 and cf2 >= 0:
        return cf1 + cf2 * (1.0 - cf1)
    elif cf1 < 0 and cf2 < 0:
        return cf1 + cf2 * (1.0 + cf1)
    else:
        denom = 1.0 - min(abs(cf1), abs(cf2))
        return (cf1 + cf2) / denom if denom != 0 else 0.0

logger.info("CF functions defined")"""
))

cells.append(code(
"""# ─── Expert Evidence Variables ───────────────────────────────────────────────
mm_cf = MinMaxScaler()

cf_df = feature_df[['Claim ID', 'Nomor Polis']].copy()

# 1. Anomaly risk (already 0–1 from Isolation Forest)
cf_df['anomaly_risk'] = feature_df['anomaly_score']

# 2. Location risk (binary: overseas = 1)
cf_df['location_risk'] = feature_df['high_risk_region_indicator'].astype(float)

# 3. Claim severity risk (normalised claim amount)
cf_df['claim_severity_risk'] = mm_cf.fit_transform(
    feature_df['claim_severity'].fillna(0).values.reshape(-1, 1)
).flatten()

# 4. Behavioural risk: composite of frequency + velocity + repeat
vel_norm = mm_cf.fit_transform(
    feature_df['claim_velocity'].fillna(0).values.reshape(-1, 1)
).flatten()
cf_df['behavioral_risk'] = (
    feature_df['suspicious_claim_frequency'] * 0.40 +
    feature_df['repeated_claim_indicator']   * 0.30 +
    vel_norm                                  * 0.30
).clip(0.0, 1.0)

# 5. Residual (phantom-billing) risk
cf_df['residual_risk'] = mm_cf.fit_transform(
    feature_df['residual_cost'].fillna(0).values.reshape(-1, 1)
).flatten()

logger.info("Expert evidence variables computed")
display(cf_df[['anomaly_risk', 'location_risk', 'claim_severity_risk',
               'behavioral_risk', 'residual_risk']].describe().round(4))"""
))

cells.append(code(
"""# ─── Calculate CF Per Variable ───────────────────────────────────────────────
cf_df['cf_anomaly']   = cf_df['anomaly_risk'].apply(cf_single)
cf_df['cf_location']  = cf_df['location_risk'].apply(lambda x: cf_single(x, high_thresh=0.5, med_thresh=0.0))
cf_df['cf_severity']  = cf_df['claim_severity_risk'].apply(cf_single)
cf_df['cf_behavioral']= cf_df['behavioral_risk'].apply(cf_single)
cf_df['cf_residual']  = cf_df['residual_risk'].apply(cf_single)

# ─── Sequential CF Combination ───────────────────────────────────────────────
def compute_combined_cf(row: pd.Series) -> float:
    \"\"\"Sequentially combine all expert rule CFs.\"\"\"
    cf_values = [
        row['cf_anomaly'],
        row['cf_location'],
        row['cf_severity'],
        row['cf_behavioral'],
        row['cf_residual'],
    ]
    combined = cf_values[0]
    for cf_next in cf_values[1:]:
        combined = combine_cf(combined, cf_next)
    return round(combined, 4)

cf_df['cf_combined'] = cf_df.apply(compute_combined_cf, axis=1)

# Normalise combined CF to [0, 1]
cf_min = cf_df['cf_combined'].min()
cf_max = cf_df['cf_combined'].max()
cf_df['certainty_factor_score'] = (
    (cf_df['cf_combined'] - cf_min) / (cf_max - cf_min + 1e-9)
).round(4)

feature_df['certainty_factor_score'] = cf_df['certainty_factor_score'].values

logger.info(f"CF Score — min: {feature_df['certainty_factor_score'].min():.4f}  "
            f"max: {feature_df['certainty_factor_score'].max():.4f}  "
            f"mean: {feature_df['certainty_factor_score'].mean():.4f}")"""
))

cells.append(code(
"""# ─── CF Distribution Visualisation ─────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].hist(feature_df['certainty_factor_score'], bins=50,
             color='#9b59b6', alpha=0.85, edgecolor='white', linewidth=0.3)
axes[0].set_xlabel('Certainty Factor Score (normalised)')
axes[0].set_ylabel('Frekuensi')
axes[0].set_title('Distribusi Certainty Factor Score')

# Individual CF components
cf_components = ['cf_anomaly', 'cf_location', 'cf_severity', 'cf_behavioral', 'cf_residual']
cf_means = cf_df[cf_components].mean()
axes[1].barh(cf_components, cf_means.values, color='#8e44ad', alpha=0.8)
axes[1].axvline(x=0, color='black', linewidth=0.8)
axes[1].set_xlabel('Mean CF Value')
axes[1].set_title('Mean CF per Expert Variable')

plt.suptitle('Certainty Factor Expert System — AXA PRISM', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/cf_distribution.png', bbox_inches='tight', dpi=150)
plt.show()

print("\\nCF Component Summary:")
display(cf_df[cf_components + ['certainty_factor_score']].describe().round(4))"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 9 — FINAL RISK SCORE
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 9 — Final Risk Score

**Purpose:** Fuse ML anomaly intelligence, expert CF reasoning, and cluster segmentation into a single explainable risk signal.

### Formula

$$\\text{FinalRiskScore} = 0.50 \\times \\text{anomaly\\_score} + 0.30 \\times \\text{certainty\\_factor\\_score} + 0.20 \\times \\text{cluster\\_weight}$$

### Risk Categories

| Score Range | Category |
|---|---|
| ≥ 0.75 | **Critical** |
| 0.55 – 0.74 | **High** |
| 0.35 – 0.54 | **Medium** |
| < 0.35 | **Low** |"""
))

cells.append(code(
"""# ─── Merge Cluster Scores ─────────────────────────────────────────────────────
feature_df = feature_df.merge(
    policy_cluster_df[['Nomor Polis', 'risk_cluster', 'risk_cluster_num']],
    on='Nomor Polis', how='left'
)

# Normalise cluster rank to [0, 1]
max_rank = feature_df['risk_cluster_num'].max()
feature_df['cluster_weight'] = (feature_df['risk_cluster_num'] / max(max_rank, 1)).fillna(0)

# ─── Weighted Combination ──────────────────────────────────────────────────
W_ANOMALY  = 0.50
W_CF       = 0.30
W_CLUSTER  = 0.20

feature_df['final_risk_score'] = (
    W_ANOMALY * feature_df['anomaly_score'] +
    W_CF      * feature_df['certainty_factor_score'] +
    W_CLUSTER * feature_df['cluster_weight']
).clip(0.0, 1.0).round(4)

# ─── Risk Level Classification ──────────────────────────────────────────────
def classify_risk(score: float) -> str:
    if score >= 0.75:  return 'Critical'
    elif score >= 0.55: return 'High'
    elif score >= 0.35: return 'Medium'
    else:              return 'Low'

feature_df['risk_level'] = feature_df['final_risk_score'].apply(classify_risk)

risk_dist = feature_df['risk_level'].value_counts()
logger.info("Risk Level Distribution:")
for level, count in risk_dist.items():
    logger.info(f"  {level:10s}: {count:,}  ({count/len(feature_df)*100:.1f}%)")"""
))

cells.append(code(
"""# ─── Risk Score Visualisation ───────────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Distribution
axes[0].hist(feature_df['final_risk_score'], bins=60,
             color='#e67e22', alpha=0.85, edgecolor='white', linewidth=0.3)
for thresh, color, label in [(0.35, '#f1c40f', 'Medium'), (0.55, '#e67e22', 'High'), (0.75, '#e74c3c', 'Critical')]:
    axes[0].axvline(x=thresh, color=color, linestyle='--', linewidth=1.6, label=label)
axes[0].set_xlabel('Final Risk Score')
axes[0].set_ylabel('Frekuensi')
axes[0].set_title('Distribusi Final Risk Score')
axes[0].legend(title='Threshold', fontsize=9)

# Pie
RISK_ORDER  = ['Low', 'Medium', 'High', 'Critical']
RISK_COLORS = ['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c']
risk_vals   = [risk_dist.get(r, 0) for r in RISK_ORDER]
non_zero    = [(l, v, c) for l, v, c in zip(RISK_ORDER, risk_vals, RISK_COLORS) if v > 0]
axes[1].pie(
    [v for _, v, _ in non_zero],
    labels=[l for l, _, _ in non_zero],
    autopct='%1.1f%%',
    colors=[c for _, _, c in non_zero],
    startangle=90
)
axes[1].set_title('Komposisi Risk Level')

plt.suptitle('Final Risk Score — AXA PRISM Fusion Model', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/risk_score_distribution.png', bbox_inches='tight', dpi=150)
plt.show()"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 10 — EDAS
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 10 — EDAS Decision Support System

**Purpose:** Rank suspicious claims to help claims managers prioritise their investigation backlog.

### EDAS Algorithm (Evaluation based on Distance from Average Solution)

**Step 1** — Average Solution (AV):
$$AV_j = \\frac{1}{n} \\sum_{i=1}^n x_{ij}$$

**Step 2** — Positive Distance from Average (PDA) for benefit criteria:
$$PDA_{ij} = \\frac{\\max(0,\\; x_{ij} - AV_j)}{AV_j}$$

**Step 3** — Negative Distance from Average (NDA):
$$NDA_{ij} = \\frac{\\max(0,\\; AV_j - x_{ij})}{AV_j}$$

**Step 4** — Weighted sums SP and SN.

**Step 5** — Final EDAS score:
$$AS_i = \\frac{(NSP_i + 1 - NSN_i)}{2}$$

### Criteria & Weights

| Criterion | Weight | Rationale |
|---|---|---|
| `claim_severity` | 0.25 | Core financial exposure |
| `residual_cost` | 0.20 | Billing inflation signal |
| `anomaly_score` | 0.20 | ML fraud likelihood |
| `certainty_factor_score` | 0.20 | Expert system confidence |
| `final_risk_score` | 0.15 | Fused risk signal |"""
))

cells.append(code(
"""# ─── EDAS Setup ──────────────────────────────────────────────────────────────
EDAS_CRITERIA = [
    'claim_severity',
    'residual_cost',
    'anomaly_score',
    'certainty_factor_score',
    'final_risk_score'
]

EDAS_WEIGHTS = {
    'claim_severity'         : 0.25,
    'residual_cost'          : 0.20,
    'anomaly_score'          : 0.20,
    'certainty_factor_score' : 0.20,
    'final_risk_score'       : 0.15,
}

edas_mat = feature_df[EDAS_CRITERIA].fillna(0).copy()

# Step 1 — Average Solution
AV = edas_mat.mean()
logger.info("Average Solution (AV):")
for col, val in AV.items():
    logger.info(f"  {col:30s}: {val:.4f}")"""
))

cells.append(code(
"""# ─── EDAS Distance Calculation ───────────────────────────────────────────────
PDA = pd.DataFrame(index=edas_mat.index, columns=EDAS_CRITERIA, dtype=float)
NDA = pd.DataFrame(index=edas_mat.index, columns=EDAS_CRITERIA, dtype=float)

for col in EDAS_CRITERIA:
    av_val = AV[col] if AV[col] != 0 else 1e-9
    PDA[col] = ((edas_mat[col] - av_val) / av_val).clip(lower=0)
    NDA[col] = ((av_val - edas_mat[col]) / av_val).clip(lower=0)

# Step 4 — Weighted sums
SP = sum(EDAS_WEIGHTS[c] * PDA[c] for c in EDAS_CRITERIA)
SN = sum(EDAS_WEIGHTS[c] * NDA[c] for c in EDAS_CRITERIA)

# Step 5 — Normalise and final score
NSP = SP / SP.max() if SP.max() > 0 else SP
NSN = SN / SN.max() if SN.max() > 0 else SN

feature_df['edas_score'] = ((NSP + (1 - NSN)) / 2).round(4)

# Rank (1 = highest investigation priority)
feature_df['dss_rank'] = feature_df['edas_score'].rank(ascending=False, method='first').astype(int)

logger.info(f"EDAS Score — min: {feature_df['edas_score'].min():.4f}  max: {feature_df['edas_score'].max():.4f}")"""
))

cells.append(code(
"""# ─── Investigation Priority Classification ───────────────────────────────────
def assign_priority(score: float) -> str:
    if score >= 0.75:   return 'Fraud Investigation Priority'
    elif score >= 0.55: return 'Suspicious Claim'
    elif score >= 0.35: return 'Review Required'
    else:               return 'Valid Claim'

feature_df['investigation_priority'] = feature_df['edas_score'].apply(assign_priority)

priority_dist = feature_df['investigation_priority'].value_counts()
logger.info("Investigation Priority:")
for pri, cnt in priority_dist.items():
    logger.info(f"  {pri:35s}: {cnt:,}  ({cnt/len(feature_df)*100:.1f}%)")

# ─── EDAS Visualisation ──────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].hist(feature_df['edas_score'], bins=60,
             color='#16a085', alpha=0.85, edgecolor='white', linewidth=0.3)
for thresh, color, label in [(0.35, '#f1c40f', 'Review'), (0.55, '#e67e22', 'Suspicious'), (0.75, '#e74c3c', 'Fraud')]:
    axes[0].axvline(x=thresh, color=color, linestyle='--', linewidth=1.6, label=label)
axes[0].set_xlabel('EDAS Score')
axes[0].set_ylabel('Frekuensi')
axes[0].set_title('Distribusi EDAS Score')
axes[0].legend(title='Threshold', fontsize=9)

P_ORDER  = ['Valid Claim', 'Review Required', 'Suspicious Claim', 'Fraud Investigation Priority']
P_COLORS = ['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c']
p_vals   = [priority_dist.get(p, 0) for p in P_ORDER]
non_zero = [(l, v, c) for l, v, c in zip(P_ORDER, p_vals, P_COLORS) if v > 0]
axes[1].pie([v for _, v, _ in non_zero], labels=[l for l, _, _ in non_zero],
            autopct='%1.1f%%', colors=[c for _, _, c in non_zero], startangle=90)
axes[1].set_title('Distribusi Investigation Priority')

plt.suptitle('EDAS Decision Support System — AXA PRISM', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/edas_results.png', bbox_inches='tight', dpi=150)
plt.show()

print("\\nTop 10 Claims by DSS Rank:")
TOP_COLS = ['Claim ID', 'Nomor Polis', 'anomaly_score', 'certainty_factor_score',
            'final_risk_score', 'edas_score', 'dss_rank', 'investigation_priority']
display(feature_df.sort_values('dss_rank').head(10)[TOP_COLS])"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 11 — RECOMMENDATION ENGINE
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 11 — Final Recommendation Engine

**Purpose:** Translate all quantitative scores into human-readable, actionable recommendations for claims managers.

**Logic:** Rule-based cascade combining `final_risk_score`, `edas_score`, `anomaly_score`, and contextual flags.

> The frontend Next.js dashboard will display these recommendations alongside clickable claim cards."""
))

cells.append(code(
"""def generate_recommendation(row: pd.Series) -> str:
    \"\"\"
    Rule-based recommendation engine.

    Priority cascade — first matching rule wins.
    The frontend slider weights (CF weights) will eventually
    modulate these rules in real-time via the FastAPI inference endpoint.
    \"\"\"
    rs   = row['final_risk_score']
    es   = row['edas_score']
    ano  = row['anomaly_score']
    cf   = row['certainty_factor_score']
    ovs  = row['high_risk_region_indicator']
    rep  = row['repeated_claim_indicator']

    # Rule 1 — Critical: both risk and EDAS extreme
    if rs >= 0.75 and es >= 0.75:
        return 'IMMEDIATE INVESTIGATION — High Confidence Fraud'

    # Rule 2 — Overseas + high anomaly + high risk
    if ovs == 1 and rs >= 0.55 and ano >= 0.60:
        return 'PRIORITY REVIEW — Overseas High-Risk Claim'

    # Rule 3 — Strong ML + expert system convergence
    if ano >= 0.70 and cf >= 0.65:
        return 'FLAG FOR INVESTIGATION — Anomaly + Expert Rule Match'

    # Rule 4 — Repeated claims from a suspicious policy
    if rep == 1 and rs >= 0.55 and es >= 0.50:
        return 'INVESTIGATION REQUIRED — Repeated Suspicious Pattern'

    # Rule 5 — Suspicious EDAS with elevated risk
    if es >= 0.55 and rs >= 0.45:
        return 'REVIEW REQUIRED — Suspicious Pattern Detected'

    # Rule 6 — Elevated but not critical
    if rs >= 0.35 or es >= 0.35:
        return 'MONITOR — Elevated Risk Profile'

    # Default — clean claim
    return 'APPROVE — Low Risk Claim'


feature_df['recommendation'] = feature_df.apply(generate_recommendation, axis=1)

rec_dist = feature_df['recommendation'].value_counts()
logger.info("Recommendation distribution:")
for rec, cnt in rec_dist.items():
    logger.info(f"  {cnt:5,}  ({cnt/len(feature_df)*100:.1f}%)  →  {rec}")"""
))

cells.append(code(
"""# ─── Recommendation Chart ────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(13, 5))

REC_COLORS = ['#27ae60', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#c0392b']
rec_sorted = rec_dist.sort_values(ascending=True)
bars = ax.barh(rec_sorted.index, rec_sorted.values,
               color=REC_COLORS[:len(rec_sorted)][::-1])
ax.set_xlabel('Jumlah Klaim')
ax.set_title('Distribusi Rekomendasi — AXA PRISM Recommendation Engine',
             fontsize=13, fontweight='bold')
ax.bar_label(bars, labels=[f' {v:,}' for v in rec_sorted.values], padding=2, fontsize=10)
plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/recommendations.png', bbox_inches='tight', dpi=150)
plt.show()"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 12 — VISUALIZATION & REPORTING
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 12 — Visualisation & Reporting

**Purpose:** Produce dashboard-ready output charts for the Next.js frontend and executive reporting.

**Outputs:** PNG charts saved to `outputs/`"""
))

cells.append(code(
"""# ─── Master Dashboard ────────────────────────────────────────────────────────
fig = plt.figure(figsize=(20, 13))
fig.suptitle('AXA PRISM — Intelligence Dashboard Summary', fontsize=16, fontweight='bold', y=1.01)

# 1. Risk Cluster Pie
ax1 = fig.add_subplot(2, 3, 1)
c_counts = feature_df['risk_cluster'].value_counts()
CCOLORS = ['#2ecc71', '#f39c12', '#e74c3c', '#9b59b6'][:len(c_counts)]
ax1.pie(c_counts.values, labels=c_counts.index, autopct='%1.1f%%', colors=CCOLORS, startangle=90)
ax1.set_title('Customer Risk Segments', fontweight='bold')

# 2. Anomaly Bar
ax2 = fig.add_subplot(2, 3, 2)
a_counts = feature_df['anomaly_label'].value_counts()
ax2.bar(a_counts.index, a_counts.values, color=['#2ecc71', '#e74c3c'])
ax2.set_title('Anomaly Detection', fontweight='bold')
ax2.set_ylabel('Count')
for bar in ax2.patches:
    ax2.annotate(f'{int(bar.get_height()):,}',
                 (bar.get_x() + bar.get_width()/2, bar.get_height()),
                 ha='center', va='bottom', fontsize=10)

# 3. Risk Level Bar
ax3 = fig.add_subplot(2, 3, 3)
r_counts = feature_df['risk_level'].value_counts()
r_vals   = [r_counts.get(r, 0) for r in RISK_ORDER]
bars3 = ax3.bar(RISK_ORDER, r_vals, color=['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c'])
ax3.set_title('Risk Level Distribution', fontweight='bold')
ax3.set_ylabel('Count')
ax3.bar_label(bars3)

# 4. Top 10 Claims
ax4 = fig.add_subplot(2, 3, 4)
top10 = feature_df.nlargest(10, 'final_risk_score')[['Claim ID', 'final_risk_score']]
ax4.barh(top10['Claim ID'], top10['final_risk_score'], color='#e74c3c')
ax4.set_xlabel('Final Risk Score')
ax4.set_title('Top 10 Highest Risk Claims', fontweight='bold')
ax4.set_xlim(0, 1.05)

# 5. Scatter: Anomaly vs EDAS
ax5 = fig.add_subplot(2, 3, 5)
pri_color_map = {
    'Fraud Investigation Priority' : '#e74c3c',
    'Suspicious Claim'             : '#e67e22',
    'Review Required'              : '#f1c40f',
    'Valid Claim'                  : '#2ecc71',
}
sc_colors = [pri_color_map.get(p, '#95a5a6') for p in feature_df['investigation_priority']]
ax5.scatter(feature_df['anomaly_score'], feature_df['edas_score'],
            c=sc_colors, alpha=0.4, s=10)
ax5.set_xlabel('Anomaly Score')
ax5.set_ylabel('EDAS Score')
ax5.set_title('Anomaly Score vs EDAS Score', fontweight='bold')
for label, color in pri_color_map.items():
    ax5.scatter([], [], c=color, label=label, s=40)
ax5.legend(fontsize=7, loc='upper left')

# 6. Avg claim by priority
ax6 = fig.add_subplot(2, 3, 6)
pri_sev = feature_df.groupby('investigation_priority')['claim_severity'].mean().sort_values(ascending=False)
ax6.bar(range(len(pri_sev)), pri_sev.values / 1e6,
        color=['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71'][:len(pri_sev)])
ax6.set_xticks(range(len(pri_sev)))
ax6.set_xticklabels([p.replace(' ', '\\n') for p in pri_sev.index], fontsize=8)
ax6.set_ylabel('Avg Claim (Juta IDR)')
ax6.set_title('Avg Claim by Priority', fontweight='bold')

plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/dashboard_summary.png', bbox_inches='tight', dpi=150)
plt.show()
logger.info("Master dashboard saved to outputs/dashboard_summary.png")"""
))

cells.append(code(
"""# ─── EDAS Rank Chart (Top 20 for Manager) ───────────────────────────────────
top_20 = feature_df.sort_values('dss_rank').head(20).copy()

fig, ax = plt.subplots(figsize=(12, 8))
colors_20 = [pri_color_map.get(p, '#95a5a6') for p in top_20['investigation_priority']]
bars = ax.barh(top_20['Claim ID'], top_20['edas_score'], color=colors_20)
ax.set_xlabel('EDAS Score (Investigation Priority)')
ax.set_title('Top 20 Claims — EDAS Investigation Priority Ranking', fontsize=12, fontweight='bold')
ax.set_xlim(0, 1.05)
ax.bar_label(bars, labels=[f' {v:.3f}' for v in top_20['edas_score']], padding=2, fontsize=8)

for label, color in pri_color_map.items():
    ax.barh([], [], color=color, label=label)
ax.legend(loc='lower right', fontsize=9)

plt.tight_layout()
plt.savefig(f'{OUTPUT_DIR}/edas_top20_ranking.png', bbox_inches='tight', dpi=150)
plt.show()

logger.info("Visualisation & Reporting complete")
print(f"\\nAll charts saved to '{OUTPUT_DIR}/'")"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 13 — SAVE MODELS
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 13 — Save Models

**Purpose:** Persist all trained models to disk for FastAPI inference loading.

**Saved files:**

| File | Contents |
|---|---|
| `kmeans.pkl` | Trained KMeans cluster model |
| `isolation_forest.pkl` | Trained Isolation Forest |
| `cluster_scaler.pkl` | StandardScaler for cluster features |
| `iso_scaler.pkl` | StandardScaler for IF features |
| `score_normaliser.pkl` | MinMaxScaler for anomaly score normalisation |
| `label_encoders.pkl` | Dict of LabelEncoder per categorical column |
| `plan_expected_cost.pkl` | Plan → median cost benchmark dict |"""
))

cells.append(code(
"""# ─── Persist All Trained Artefacts ──────────────────────────────────────────
artefacts = {
    'kmeans'               : kmeans,
    'isolation_forest'     : iso_forest,
    'cluster_scaler'       : cluster_scaler,
    'iso_scaler'           : iso_scaler,
    'score_normaliser'     : score_normaliser,
    'label_encoders'       : label_encoders,
    'plan_expected_cost'   : plan_expected_cost.to_dict(),
    'model_features'       : MODEL_FEATURES,
    'cluster_features'     : CLUSTER_FEATURES,
    'iso_features'         : ISO_FEATURES,
    'risk_label_map'       : RISK_LABEL_MAP,
}

for name, obj in artefacts.items():
    path = f'{MODEL_DIR}/{name}.pkl'
    joblib.dump(obj, path)
    logger.info(f"Saved  →  {path}")

# Verify
saved = sorted(os.listdir(MODEL_DIR))
print(f"\\nModels saved ({len(saved)} files):")
for f in saved:
    size_kb = os.path.getsize(f'{MODEL_DIR}/{f}') / 1024
    print(f"  {f:40s}  {size_kb:.1f} KB")"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 14 — SUPABASE PREPARATION
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 14 — Supabase Schema Preparation

**Purpose:** Produce a `processed_claims` dataframe exactly matching the Supabase PostgreSQL table schema.

**Table:** `processed_claims`

Each row is one claim record with all ML scores, CF scores, EDAS rank, and recommendation attached."""
))

cells.append(code(
"""# ─── Build Supabase-Compatible DataFrame ────────────────────────────────────
supabase_df = pd.DataFrame({
    'id'                      : [str(uuid_lib.uuid4()) for _ in range(len(feature_df))],
    'claim_id'                : feature_df['Claim ID'].values,
    'policy_id'               : feature_df['Nomor Polis'].values,
    'plan_code'               : feature_df['Plan Code'].values,
    'gender'                  : feature_df['Gender'].values,
    'domisili'                : feature_df['Domisili'].values,
    'lokasi_rs'               : feature_df['Lokasi RS'].values,
    'icd_diagnosis'           : feature_df['ICD Diagnosis'].values,
    'care_type'               : feature_df['Inpatient/Outpatient'].values,
    'is_cashless'             : feature_df['is_cashless'].values,
    'actual_cost'             : feature_df['Nominal Biaya RS Yang Terjadi'].round(2).values,
    'approved_cost'           : feature_df['Nominal Klaim Yang Disetujui'].round(2).values,
    'expected_cost'           : feature_df['expected_claim_cost'].round(2).values,
    'residual_cost'           : feature_df['residual_cost'].round(2).values,
    'claim_to_expected_ratio' : feature_df['claim_to_expected_ratio'].round(4).values,
    'anomaly_score'           : feature_df['anomaly_score'].values,
    'anomaly_label'           : feature_df['anomaly_label'].values,
    'risk_cluster'            : feature_df['risk_cluster'].values,
    'certainty_factor_score'  : feature_df['certainty_factor_score'].values,
    'final_risk_score'        : feature_df['final_risk_score'].values,
    'risk_level'              : feature_df['risk_level'].values,
    'edas_score'              : feature_df['edas_score'].values,
    'dss_rank'                : feature_df['dss_rank'].values,
    'investigation_priority'  : feature_df['investigation_priority'].values,
    'recommendation'          : feature_df['recommendation'].values,
    'created_at'              : datetime.utcnow().isoformat(),
})

logger.info(f"Supabase DataFrame shape: {supabase_df.shape}")

print("\\nSchema validation:")
display(pd.DataFrame({'dtype': supabase_df.dtypes.astype(str),
                      'nulls': supabase_df.isnull().sum()}))"""
))

cells.append(code(
"""# ─── Export Files ─────────────────────────────────────────────────────────────
csv_path   = f'{OUTPUT_DIR}/processed_claims.csv'
excel_path = f'{OUTPUT_DIR}/processed_claims.xlsx'

supabase_df.to_csv(csv_path,   index=False)
supabase_df.to_excel(excel_path, index=False, engine='openpyxl')

logger.info(f"CSV   exported  → {csv_path}")
logger.info(f"Excel exported  → {excel_path}")

print(f"\\n{len(supabase_df):,} records exported")
print("\\nSample output (first 5 rows):")
display(supabase_df.head(5)[[
    'claim_id', 'policy_id', 'anomaly_score', 'certainty_factor_score',
    'final_risk_score', 'edas_score', 'dss_rank', 'investigation_priority', 'recommendation'
]])"""
))

# ─────────────────────────────────────────────────────────────
# SECTION 15 — FASTAPI TRANSITION
# ─────────────────────────────────────────────────────────────
cells.append(md(
"""---
## Section 15 — FastAPI Transition Plan

**Purpose:** Document how each notebook section maps to a modular FastAPI service.

---

### Architecture Mapping

```
Notebook Section              →   FastAPI Service
─────────────────────────────────────────────────────────────────
Section 3  (Preprocessing)    →   /app/services/preprocessing_service.py
Section 5  (Features)         →   /app/services/feature_service.py
Section 6  (K-Means)          →   /app/services/clustering_service.py
Section 7  (Isolation Forest) →   /app/services/anomaly_service.py
Section 8  (CF Expert System) →   /app/services/cf_service.py
Section 9  (Risk Score)       →   /app/services/risk_scoring_service.py
Section 10 (EDAS)             →   /app/services/edas_service.py
Section 11 (Recommendation)   →   /app/services/recommendation_service.py
Section 14 (Supabase schema)  →   /app/database/supabase_client.py
```

---

### Inference Flow (FastAPI Production)

```
POST /predict-risk
        │
        ├─ load_model()        [kmeans.pkl, isolation_forest.pkl, ...]
        ├─ preprocessing_service.preprocess(raw_claim)
        ├─ feature_service.engineer(df)
        ├─ clustering_service.predict_cluster(X)
        ├─ anomaly_service.score(X)
        ├─ cf_service.compute_cf(row)
        ├─ risk_scoring_service.compute_final_score(row)
        ├─ edas_service.rank(df)
        ├─ recommendation_service.recommend(row)
        └─ supabase_client.upsert(result)
               │
               └─ return JSON → Next.js Dashboard
```

---

### Key Separation Rules

| Notebook | FastAPI Backend |
|---|---|
| Training models | ❌ Not in inference endpoints |
| `fit()` calls | ❌ Only during offline training |
| `transform()` calls | ✅ Using pre-loaded `.pkl` models |
| `plt.show()` | ❌ No visualisation in API |
| Logging | ✅ Structured logging with `loguru` |
| Exception handling | ✅ FastAPI `HTTPException` wrappers |
| Pydantic schemas | ✅ Request/Response validation |

---

### Environment Variables (FastAPI `.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
MODEL_DIR=./saved_models
LOG_LEVEL=INFO
```

---

### Next Steps

1. **Migrate** each section into its corresponding `_service.py` module
2. **Wire** the inference pipeline in `POST /predict-risk`
3. **Deploy** training notebook in CI/CD to refresh `.pkl` models on schedule
4. **Connect** Next.js dashboard to GET `/dashboard-summary` and GET `/top-investigations`
5. **Expose** CF weight sliders via `POST /predict-risk` request body"""
))

cells.append(code(
"""# ─── Final Pipeline Summary ───────────────────────────────────────────────────
print("=" * 65)
print("  AXA PRISM — Notebook Pipeline Complete")
print("=" * 65)

summary = {
    'Total claims processed'          : len(feature_df),
    'Unique policies'                  : feature_df['Nomor Polis'].nunique(),
    'Anomalies detected'               : int(feature_df['anomaly_binary'].sum()),
    'Critical risk claims'             : int((feature_df['risk_level'] == 'Critical').sum()),
    'High risk claims'                 : int((feature_df['risk_level'] == 'High').sum()),
    'Fraud investigation priority'     : int((feature_df['investigation_priority'] == 'Fraud Investigation Priority').sum()),
    'Total approved claim value (IDR)' : f"{feature_df['Nominal Klaim Yang Disetujui'].sum():,.0f}",
    'Models saved'                     : len(saved),
    'Output files'                     : len(os.listdir(OUTPUT_DIR)),
}

for k, v in summary.items():
    print(f"  {k:45s}: {v}")

print("=" * 65)
print("  Ready for FastAPI migration → /app/services/")
print("=" * 65)"""
))

# ─────────────────────────────────────────────────────────────
# Serialise and write
# ─────────────────────────────────────────────────────────────
notebook = {
    "nbformat": 4,
    "nbformat_minor": 5,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.10.0",
            "pygments_lexer": "ipython3",
            "file_extension": ".py",
            "codemirror_mode": {"name": "ipython", "version": 3},
            "mimetype": "text/x-python"
        }
    },
    "cells": cells,
}

out_path = '/mnt/user-data/outputs/AXA_PRISM_Notebook.ipynb'
with open(out_path, 'w', encoding='utf-8') as fh:
    json.dump(notebook, fh, indent=1, ensure_ascii=False)

size_kb = os.path.getsize(out_path) / 1024
print(f"Notebook written → {out_path}  ({size_kb:.1f} KB)  |  {len(cells)} cells")
