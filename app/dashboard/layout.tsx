"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLayout } from "@/lib/hooks/useLayout";
import { usePreferences } from "@/lib/hooks/usePreferences";
import { FocusModeContext } from "@/lib/hooks/useFocusMode";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { DocList } from "@/components/doclist/DocList";
import { ThemeApplier } from "@/components/ThemeApplier";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { layout, ready: layoutReady, toggleSidebar, toggleDocList } = useLayout();
  const { prefs, ready: prefsReady, updatePrefs } = usePreferences();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  // Initialise focus mode from saved preference once prefs load
  useEffect(() => {
    if (prefsReady) setFocusMode(prefs.focusModeDefault);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsReady]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth");
  }, [user, authLoading, router]);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => {
      const next = !prev;
      updatePrefs({ focusModeDefault: next });
      return next;
    });
  }, [updatePrefs]);

  if (authLoading || !layoutReady) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <FocusModeContext.Provider value={{ focusMode, toggleFocusMode }}>
      <ThemeApplier />
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Panels slide away in focus mode */}
        <div className={`flex h-full transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${focusMode ? "w-0" : ""}`}>
          <Sidebar
            collapsed={layout.sidebarCollapsed}
            onToggle={toggleSidebar}
            onOpenSettings={() => setSettingsOpen(true)}
          />
          <DocList collapsed={layout.docListCollapsed} onToggle={toggleDocList} />
        </div>

        <main className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          {children}
        </main>
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </FocusModeContext.Provider>
  );
}
