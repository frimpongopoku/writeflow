import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Crimson_Pro,
  Lora,
  DM_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// UI chrome font — modern, premium feel
const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Default editor font — gorgeous serif for writing
const crimsonPro = Crimson_Pro({
  variable: "--font-editor-default",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

// Serif typography option
const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Sans-serif typography option
const dmSans = DM_Sans({
  variable: "--font-sans-alt",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Monospace typography option
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "WriteFlow",
  description: "A beautiful, distraction-free writing app.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={[
        jakartaSans.variable,
        crimsonPro.variable,
        lora.variable,
        dmSans.variable,
        jetbrainsMono.variable,
        "h-full antialiased",
      ].join(" ")}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
