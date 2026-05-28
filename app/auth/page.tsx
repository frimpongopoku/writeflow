"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { Loader2, PenLine, Sparkles, BookOpen, Palette } from "lucide-react";
import versionData from "@/version.json";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-text-secondary" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 min-h-screen bg-background"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] bg-surface border-r border-border px-16 py-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-9 rounded-xl bg-accent/15">
            <PenLine className="size-5 text-accent" strokeWidth={2} />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-text-primary">WriteFlow</span>
        </div>

        {/* Hero copy */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-[42px] font-bold leading-[1.15] tracking-tight text-text-primary">
              Your writing,<br />
              <span className="text-accent">beautifully uncluttered.</span>
            </h1>
            <p className="text-[16px] font-normal text-text-secondary leading-relaxed max-w-md">
              A distraction-free space to think, draft, and create. Markdown
              that renders as you type. Everything saved automatically.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-4">
            {[
              {
                icon: <PenLine className="size-4 text-accent" strokeWidth={2} />,
                title: "Live markdown rendering",
                desc: "Type syntax, see formatting. No preview toggle needed.",
              },
              {
                icon: <Palette className="size-4 text-accent" strokeWidth={2} />,
                title: "Five beautiful themes",
                desc: "Light, Dark, Sepia, Nord, Solarized — all contrast-tested.",
              },
              {
                icon: <Sparkles className="size-4 text-accent" strokeWidth={2} />,
                title: "AI writing assistant",
                desc: "Rephrase, summarise, fix grammar — right inside your text.",
              },
              {
                icon: <BookOpen className="size-4 text-accent" strokeWidth={2} />,
                title: "Journaling & Markdown modes",
                desc: "WYSIWYG or raw split-pane — switch any time.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex items-center justify-center size-7 rounded-lg bg-accent/10 shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-text-primary">{title}</p>
                  <p className="text-[12.5px] font-normal text-text-secondary mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version */}
        <p className="text-[11.5px] font-medium text-text-secondary/60">
          WriteFlow v{versionData.version} {versionData.stage}
        </p>
      </div>

      {/* ── Right panel — sign in ── */}
      <div className="flex flex-col flex-1 items-center justify-center px-8 py-14 bg-background">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="flex items-center justify-center size-9 rounded-xl bg-accent/15">
            <PenLine className="size-5 text-accent" strokeWidth={2} />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-text-primary">WriteFlow</span>
        </div>

        <div className="w-full max-w-[360px] space-y-8">
          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-[24px] font-bold tracking-tight text-text-primary">
              Welcome back
            </h2>
            <p className="text-[14px] font-normal text-text-secondary">
              Sign in to continue writing.
            </p>
          </div>

          {/* Sign in card */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 h-11 px-5 rounded-xl border border-border bg-background text-[13.5px] font-semibold text-text-primary hover:bg-hover transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-3 text-[11px] font-medium text-text-secondary/60">
                  Secure sign-in via Firebase
                </span>
              </div>
            </div>

            <p className="text-center text-[11.5px] font-normal text-text-secondary/60 leading-relaxed">
              Your writing is private and encrypted.<br />
              Only you can access your documents.
            </p>
          </div>

          {/* Mobile version */}
          <p className="lg:hidden text-center text-[11px] font-medium text-text-secondary/50">
            WriteFlow v{versionData.version} {versionData.stage}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" />
    </svg>
  );
}
