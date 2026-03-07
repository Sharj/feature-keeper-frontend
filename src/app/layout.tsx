import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Feature Keeper",
  description: "Feature request and feedback board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-gray-50 text-gray-900"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
