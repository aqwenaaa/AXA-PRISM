import type { ReactNode } from "react";
import { NextDashboardLayout } from "../components/dashboard-layout";

export default function Layout({ children }: { children: ReactNode }) {
  return <NextDashboardLayout>{children}</NextDashboardLayout>;
}
