"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Sun className={`w-5 h-5 ${!isDark ? "opacity-100" : "opacity-40"} transition-opacity`} />
      
      <label className="relative inline-block w-10 h-5 cursor-pointer">
        <input
          type="checkbox"
          checked={isDark}
          onChange={() => setTheme(isDark ? "light" : "dark")}
          className="sr-only peer"
        />
        <div className="bg-gray-400 peer-checked:bg-black dark:bg-gray-600 rounded-full w-full h-full transition-colors" />
        <div
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform
            peer-checked:translate-x-5
          `}
        />
      </label>

      <Moon className={`w-5 h-5 ${isDark ? "opacity-100" : "opacity-40"} transition-opacity`} />
    </div>
  );
}
