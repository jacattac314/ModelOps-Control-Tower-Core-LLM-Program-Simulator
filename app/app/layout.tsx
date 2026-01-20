import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModelOps Control Tower",
  description: "Research program operations simulator for frontier LLM development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
