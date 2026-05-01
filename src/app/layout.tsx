import type { Metadata } from "next";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "AXA-PRISM",
  description: "Decision Support System for insurance claim risk mitigation",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
