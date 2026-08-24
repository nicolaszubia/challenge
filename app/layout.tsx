import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spectra — Visual Accessibility QA",
  description:
    "Upload a screenshot to simulate visual conditions and identify potential accessibility issues. An experiment by LaunchPad Lab.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
