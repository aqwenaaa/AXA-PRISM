import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/landing";
import LoginPage from "./pages/login";
import LogoutPage from "./pages/logout";
import ForgotPasswordPage from "./pages/forgot-password";
import ResetPasswordPage from "./pages/reset-password";
import ProfilePage from "./pages/profile";
import AboutAXAPage from "./pages/about-axa";
import HealthcarePage from "./pages/healthcare";
import SecurityPage from "./pages/security";
import FAQPage from "./pages/faq";
import DataIngestionPage from "./pages/data-ingestion";
import IntelligenceLabPage from "./pages/intelligence-lab";
import MedicalAuditPage from "./pages/medical-audit";
import ExecutiveDashboardPage from "./pages/executive-dashboard";
import ClaimGrowthPage from "./pages/claim-growth";
import { DashboardLayout } from "./components/dashboard-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
  {
    path: "/logout",
    Component: LogoutPage,
  },
  {
    path: "/about-axa",
    Component: AboutAXAPage,
  },
  {
    path: "/healthcare",
    Component: HealthcarePage,
  },
  {
    path: "/security",
    Component: SecurityPage,
  },
  {
    path: "/faq",
    Component: FAQPage,
  },
  {
    Component: DashboardLayout,
    children: [
      {
        path: "data-ingestion",
        Component: DataIngestionPage,
      },
      {
        path: "intelligence-lab",
        Component: IntelligenceLabPage,
      },
      {
        path: "medical-audit",
        Component: MedicalAuditPage,
      },
      {
        path: "executive-dashboard",
        Component: ExecutiveDashboardPage,
      },
      {
        path: "claim-growth",
        Component: ClaimGrowthPage,
      },
      {
        path: "profile",
        Component: ProfilePage,
      },
    ],
  },
]);