"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight } from "lucide-react"
import { login } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await login(username, password)
      if (result.success) {
        toast.success("Đăng nhập thành công")
        router.replace(result.role === "student" ? "/student" : "/")
        router.refresh()
      } else {
        toast.error(result.message ?? "Đăng nhập thất bại")
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username" className="text-xs font-bold text-foreground">Tài khoản</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          autoComplete="username"
          required
          className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold focus:ring-2 focus:ring-primary/20 h-10"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-xs font-bold text-foreground">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold focus:ring-2 focus:ring-primary/20 h-10"
        />
      </div>
      <Button type="submit" className="mt-3 w-full h-10.5 rounded-xl font-bold gap-2 text-xs shadow-md shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all cursor-pointer" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <span>Đăng nhập hệ thống</span>
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  )
}

