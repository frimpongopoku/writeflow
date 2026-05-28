"use client";

import { createContext, useContext } from "react";

export interface FocusModeContextValue {
  focusMode: boolean;
  toggleFocusMode: () => void;
}

export const FocusModeContext = createContext<FocusModeContextValue>({
  focusMode: false,
  toggleFocusMode: () => {},
});

export function useFocusMode() {
  return useContext(FocusModeContext);
}
