"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9 rounded-xl border border-border/40" aria-label="Chuyển giao diện" disabled>
        <Sun className="size-4" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border/50 transition-all duration-200 cursor-pointer overflow-hidden"
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="size-4 transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute size-4 transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-indigo-400" />
    </Button>
  )
}

