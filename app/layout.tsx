import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Financial Blueprint",
  description: "A plain-English plan for your money.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
