"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Loader2, BookOpen } from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type ClassItem = {
  id: string
  name: string
  description: string | null
  studentCount: number
}

export function ClassManager({ classes }: { classes: ClassItem[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPending, startTransition] = useTransition()

  function addClass(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      try {
        await apiFetch("/api/classes", {
          method: "POST",
          body: { name, description: description || null },
        })
        toast.success("Đã thêm lớp học")
        setName("")
        setDescription("")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  function removeClass(id: string) {
    startTransition(async () => {
      try {
        await apiFetch(`/api/classes/${id}`, { method: "DELETE" })
        toast.success("Đã xóa lớp học")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BookOpen className="size-4" /> Quản lý lớp
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quản lý lớp học</DialogTitle>
          <DialogDescription>
            Tạo và quản lý danh sách lớp học chính quy.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={addClass} className="flex flex-col gap-3">
          <div className="space-y-2">
            <Label htmlFor="className">Tên lớp</Label>
            <Input
              id="className"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Toán 10A1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classDesc">Mô tả (tùy chọn)</Label>
            <Input
              id="classDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Luyện đề đại học..."
            />
          </div>
          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Thêm lớp
          </Button>
        </form>

        <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
          {classes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Chưa có lớp học nào.
            </p>
          ) : (
            classes.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  {c.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {c.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="secondary">{c.studentCount} HS</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeClass(c.id)}
                    disabled={isPending || c.studentCount > 0}
                    aria-label="Xóa lớp"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
