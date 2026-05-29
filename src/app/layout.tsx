import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/index.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "AXA-PRISM",
  description: "Decision Support System for insurance claim risk mitigation",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
