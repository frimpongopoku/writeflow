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

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const crimsonPro = Crimson_Pro({
  variable: "--font-editor-default",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});
const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const dmSans = DM_Sans({
  variable: "--font-sans-alt",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "WriteFlow",
  description: "A beautiful, distraction-free writing app.",
};

// Runs synchronously before first paint — no theme flash
const themeScript = `
  try {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('wf-theme') || 'null'); } catch(e) {}
    var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
`;

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
      <head>
        {/* Inline script: applies saved or system theme before any paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
