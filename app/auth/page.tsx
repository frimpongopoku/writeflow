"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { Loader2, PenLine } from "lucide-react";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-text-secondary/40" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-10 w-full max-w-[360px] px-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-accent/10">
            <PenLine className="size-6 text-accent" strokeWidth={2} />
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-semibold tracking-tight text-text-primary">WriteFlow</h1>
            <p className="text-[13.5px] font-normal text-text-secondary mt-0.5">Your distraction-free writing space.</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-xl border border-border bg-surface p-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-lg border border-border bg-background text-[13.5px] font-medium text-text-primary hover:bg-hover transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <p className="text-center text-[11.5px] font-normal text-text-secondary mt-4">
            Your writing is private and belongs to you.
          </p>
        </div>

      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" />
    </svg>
  );
}
