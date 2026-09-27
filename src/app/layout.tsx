import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tohfawala CRM",
  description: "WhatsApp-centric B2B CRM for Tohfawala corporate gifts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
