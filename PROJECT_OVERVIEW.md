# AXA-PRIS M

## Overview
A high-end, enterprise-grade Insurance Claim Analysis Platform with AI-powered analytics, built with Next.Js, Framer Motion, and Postgres Database.

## Features
- Enterprise-grade UI/UX
- Role-based access control simulation
- Interactive data visualizations
- AI-powered analytics
- Glassmorphism design
- Responsive layouts  

## Design System

### Visual Identity
- **Theme:** Modern, Enterprise-grade, Clean
- **Primary Color:** Soft Purple (#8A70D6)
- **Background:** Lavender Mist (#F3F0FF)
- **Success:** Green (#27AE60)
- **Warning:** Orange (#F2994A)
- **Typography:** Plus Jakarta Sans
- **Style:** Glassmorphism with 12px border radius and subtle shadows

## Application Structure

### Pages & Roles

#### 1. **Login Page** (/)
- Split-screen design
- Left: 3D abstract purple wave illustration
- Right: Clean white login card with glassmorphism
- Role selection for 4 user types

#### 2. **Data Ingestion** (/data-ingestion)
- **Role:** Data Operator
- **Function:** External data collection and validation
- **Features:**
  - Dual upload zones (Policy Data & Claims Data)
  - Data Quality Checker panel
  - AI Intelligence Engine trigger

#### 3. **Intelligence Lab** (/intelligence-lab)
- **Role:** Risk Analyst
- **Function:** AI analytics and pattern recognition
- **Features:**
  - Scatter plot: Expected vs Actual Cost
  - Random Forest Regression Model
  - Feature importance analysis
  - Bayesian validation status

#### 4. **Medical Audit Worklist** (/medical-audit)
- **Role:** Medical Auditor
- **Function:** Human-in-the-loop verification
- **Features:**
  - Master-detail view
  - High anomaly claims list
  - Detailed patient/hospital information
  - Audit decision form (Valid/Over-treatment/Fraud)
  - AI retraining feedback loop

#### 5. **Executive Command Dashboard** (/executive-dashboard)
- **Role:** Strategic Manager
- **Function:** Strategic insights and policy implementation
- **Features:**
  - Risk percentile summary
  - Financial impact projection
  - Strategic action recommendations
  - Policy approval workflow

## Navigation
- Persistent sidebar on the left
- Role-based menu items
- User profile section at bottom

## Tech Stack
- **Framework:** React 18.3.1
- **Router:** React Router 7.13.0
- **Styling:** Tailwind CSS 4.1.12
- **Charts:** Recharts 2.15.2
- **Icons:** Lucide React 0.487.0
- **UI Components:** Radix UI primitives

## Key Features
- ✅ Enterprise-grade UI/UX
- ✅ Role-based access control simulation
- ✅ Interactive data visualizations
- ✅ AI-powered analytics
- ✅ Glassmorphism design
- ✅ Responsive layouts
- ✅ Mock data for demonstration

## Getting Started
1. The application starts at the login page (/)
2. Click "Secure Sign In" to enter the dashboard
3. Use the sidebar to navigate between different role-based pages
4. Each page simulates real-world insurance claim analysis workflows

## Color Coding
- **Purple (#8A70D6):** Primary actions and branding
- **Green (#27AE60):** Success, valid data, savings
- **Orange (#F2994A):** Warnings, medium risk
- **Red (#d4183d):** Critical issues, fraud, high risk
