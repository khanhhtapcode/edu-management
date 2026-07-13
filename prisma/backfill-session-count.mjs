// Chạy 1 lần: đồng bộ Student.sessionCount theo số buổi đã điểm danh "Có mặt"
// có sẵn trong DB (trước khi có bộ đếm sessionCount).
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  const counts = await db.attendance.groupBy({
    by: ["studentId"],
    where: { status: "PRESENT" },
    _count: { _all: true },
  })

  console.log(`Cập nhật sessionCount cho ${counts.length} học sinh...`)

  for (const c of counts) {
    await db.student.update({
      where: { id: c.studentId },
      data: { sessionCount: c._count._all },
    })
  }

  console.log("✅ Đã đồng bộ xong.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
