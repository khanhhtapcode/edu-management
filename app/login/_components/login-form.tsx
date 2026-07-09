"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
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
        <Label htmlFor="username">Tài khoản</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          autoComplete="username"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>
      <Button type="submit" className="mt-2 w-full" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Đăng nhập
      </Button>
    </form>
  )
}
