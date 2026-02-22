"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync with system and localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    setIsDark(shouldBeDark);

    if (shouldBeDark) document.documentElement.classList.add("dark");

    setMounted(true);
  }, []);

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleDarkMode = () => setTheme(!isDark);

  if (!mounted) return <div className="w-12 h-4" />;

  return (
    <div className="flex items-center gap-2 bg-card px-2">
      {/* Sun Button */}
      <Button
        onClick={() => setTheme(false)}
        variant="ghost"
        size="icon"
        className={`p-2 ${!isDark ? "opacity-100" : "opacity-50"} cursor-pointer rounded-full dark:hover:bg-gray-600`}
        disabled={!isDark}
      >
        <Sun className="w-5 h-5 text-yellow-500" />
      </Button>

      {/* Switch */}
      <Switch
        checked={isDark}
        onCheckedChange={toggleDarkMode}
        className="bg-muted-foreground dark:bg-primary/60 cursor-pointer"
      />

      {/* Moon Button */}
      <Button
        onClick={() => setTheme(true)}
        variant="ghost"
        size="icon"
        className={`p-2 ${isDark ? "opacity-100" : "opacity-50"} cursor-pointer rounded-full hover:bg-muted/40`}
        disabled={isDark}
      >
        <Moon className="w-5 h-5 text-purple-500" />
      </Button>
    </div>
  );
};