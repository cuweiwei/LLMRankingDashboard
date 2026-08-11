import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Frontier Dashboard",
  description: "A use-case-first view of frontier model performance and API cost.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
