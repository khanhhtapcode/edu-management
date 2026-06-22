"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { apiFetch } from "@/lib/api-client"
import { studentSchema } from "@/lib/validations"
import {
  MEMBER_STATUS,
  STUDENT_STATUS_LABEL,
  GENDER,
  GENDER_LABEL,
} from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Option = { id: string; name: string }

export type StudentValues = z.infer<typeof studentSchema>

export type StudentRow = {
  id: string
  fullName: string
  dateOfBirth: string
  gender: string | null
  parentPhone: string
  schoolName: string | null
  status: string
  classId: string
  shiftId: string | null
}

const NONE = "__none__"

export function StudentForm({
  classes,
  shifts,
  initial,
  onDone,
}: {
  classes: Option[]
  shifts: Option[]
  initial?: StudentRow
  onDone: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: initial?.fullName ?? "",
      dateOfBirth: initial?.dateOfBirth?.slice(0, 10) ?? "",
      gender: (initial?.gender as StudentValues["gender"]) ?? GENDER.MALE,
      parentPhone: initial?.parentPhone ?? "",
      schoolName: initial?.schoolName ?? "",
      status: (initial?.status as StudentValues["status"]) ?? MEMBER_STATUS.ACTIVE,
      classId: initial?.classId ?? "",
      shiftId: initial?.shiftId ?? "",
    },
  })

  function onSubmit(values: StudentValues) {
    startTransition(async () => {
      try {
        const body = {
          ...values,
          shiftId: values.shiftId === NONE ? "" : values.shiftId,
        }
        if (initial) {
          await apiFetch(`/api/students/${initial.id}`, {
            method: "PATCH",
            body,
          })
          toast.success("Đã cập nhật học sinh")
        } else {
          await apiFetch("/api/students", { method: "POST", body })
          toast.success("Đã thêm học sinh mới")
        }
        router.refresh()
        onDone()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  const gender = watch("gender") ?? GENDER.MALE
  const status = watch("status")
  const classId = watch("classId")
  const shiftId = watch("shiftId") || NONE

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input id="fullName" {...register("fullName")} placeholder="Nguyễn Văn A" />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Ngày sinh</Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
          {errors.dateOfBirth && (
            <p className="text-xs text-destructive">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Giới tính</Label>
          <Select
            value={gender ?? GENDER.MALE}
            onValueChange={(v) =>
              setValue("gender", v as StudentValues["gender"], {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(GENDER).map((g) => (
                <SelectItem key={g} value={g}>
                  {GENDER_LABEL[g]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentPhone">Số điện thoại phụ huynh</Label>
        <Input
          id="parentPhone"
          inputMode="numeric"
          {...register("parentPhone")}
          placeholder="0901234567"
        />
        {errors.parentPhone && (
          <p className="text-xs text-destructive">
            {errors.parentPhone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="schoolName">Trường chính quy</Label>
        <Input
          id="schoolName"
          {...register("schoolName")}
          placeholder="THPT Chu Văn An"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Lớp đang học</Label>
          <Select
            value={classId}
            onValueChange={(v) =>
              setValue("classId", v, { shouldValidate: true, shouldDirty: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn lớp" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classId && (
            <p className="text-xs text-destructive">{errors.classId.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Ca học</Label>
          <Select value={shiftId} onValueChange={(v) => setValue("shiftId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chưa gán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Chưa gán</SelectItem>
              {shifts.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Trạng thái học tập</Label>
        <Select
          value={status}
          onValueChange={(v) => setValue("status", v as StudentValues["status"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(MEMBER_STATUS).map((s) => (
              <SelectItem key={s} value={s}>
                {STUDENT_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {initial ? "Lưu thay đổi" : "Thêm học sinh"}
      </Button>
    </form>
  )
}
