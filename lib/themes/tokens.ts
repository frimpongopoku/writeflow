export type Theme = "light" | "dark" | "sepia" | "nord" | "solarized";

export const THEMES: Theme[] = ["light", "dark", "sepia", "nord", "solarized"];

export const themeLabels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  sepia: "Sepia",
  nord: "Nord",
  solarized: "Solarized",
};
