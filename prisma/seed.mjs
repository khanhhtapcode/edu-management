import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

const DEFAULT_SHIFTS = [
  { name: "Ca 1", startTime: "07:30", endTime: "10:30" },
  { name: "Ca 2", startTime: "14:30", endTime: "16:30" },
  { name: "Ca 3", startTime: "17:00", endTime: "19:00" },
  { name: "Ca 4", startTime: "19:30", endTime: "21:30" },
]

async function main() {
  console.log("🌱 Seeding...")

  // Ca học
  const shifts = []
  for (const s of DEFAULT_SHIFTS) {
    shifts.push(await db.shift.create({ data: s }))
  }

  // Lớp học
  const class1 = await db.class.create({
    data: { name: "Toán 10A1", description: "Lớp Toán nâng cao khối 10" },
  })
  const class2 = await db.class.create({
    data: { name: "Luyện đề ĐH", description: "Luyện đề thi đại học" },
  })

  // Học sinh
  const names = [
    "Nguyễn Văn An",
    "Trần Thị Bình",
    "Lê Hoàng Cường",
    "Phạm Thị Dung",
    "Hoàng Minh Đức",
    "Vũ Thị Hà",
    "Đặng Văn Hùng",
    "Bùi Thị Lan",
  ]
  const students = []
  for (let i = 0; i < names.length; i++) {
    students.push(
      await db.student.create({
        data: {
          fullName: names[i],
          dateOfBirth: new Date(2008, i % 12, (i % 27) + 1),
          gender: i % 2 === 0 ? "MALE" : "FEMALE",
          parentPhone: `09012345${String(i).padStart(2, "0")}`,
          schoolName: "THPT Chu Văn An",
          status: "ACTIVE",
          classId: i % 2 === 0 ? class1.id : class2.id,
          shiftId: shifts[i % 2].id,
        },
      })
    )
  }

  // Buổi học + điểm danh + nhận xét cho lớp 1 (Toán 10A1) ở Ca 1
  const class1Students = students.filter((s) => s.classId === class1.id)
  const topics = [
    { topic: "Hàm số bậc hai", core: "Đồ thị parabol, đỉnh, trục đối xứng" },
    { topic: "Phương trình bậc hai", core: "Công thức nghiệm, định lý Viète" },
    { topic: "Bất phương trình", core: "Xét dấu tam thức bậc hai" },
  ]
  const now = new Date()
  for (let d = 0; d < topics.length; d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), d * 5 + 1)
    const lesson = await db.lesson.create({
      data: {
        date,
        shiftId: shifts[0].id,
        classId: class1.id,
        topic: topics[d].topic,
        coreKnowledge: topics[d].core,
        classWork: "Bài tập SGK trang 20",
        homework: "Hoàn thành bài 1-5",
      },
    })
    const statuses = ["PRESENT", "PRESENT", "PRESENT", "ABSENT"]
    for (let i = 0; i < class1Students.length; i++) {
      const st = statuses[(i + d) % statuses.length]
      await db.attendance.create({
        data: {
          lessonId: lesson.id,
          studentId: class1Students[i].id,
          status: st,
        },
      })
      await db.studentComment.create({
        data: {
          lessonId: lesson.id,
          studentId: class1Students[i].id,
          focusScore: 3 + ((i + d) % 3),
          attitude: "Tích cực",
          reception: "Tiếp thu tốt",
          improvement: "Cần luyện thêm bài tập",
        },
      })
    }
  }

  console.log("✅ Done seeding.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
