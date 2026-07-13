import { useEffect, useState } from "react";

const THEME_KEY = "theme";

// Define helper BEFORE use
function applyThemeClass(nextTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (nextTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.add("light");
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Initialize state BEFORE first render (safe)
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;

    // Default to system preference
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    return prefersDark ? "dark" : "light";
  });

  // Apply theme class **after** mounting
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // Save to localStorage whenever changed
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}