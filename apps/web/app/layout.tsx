import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DayPay — Admin & Lender Portal",
  description: "Operations console for the DayPay lending platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
