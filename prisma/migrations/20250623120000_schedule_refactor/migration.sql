-- Đồng bộ DB cũ → schema hiện tại (lớp trên buổi học, điểm danh Có mặt/Vắng)

-- 1. Lesson: thêm classId
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "classId" TEXT;

UPDATE "Lesson" l
SET "classId" = (
  SELECT s."classId"
  FROM "Student" s
  WHERE s."shiftId" = l."shiftId" AND s."status" = 'ACTIVE'
  ORDER BY s."createdAt"
  LIMIT 1
)
WHERE l."classId" IS NULL;

UPDATE "Lesson"
SET "classId" = (SELECT id FROM "Class" ORDER BY "createdAt" LIMIT 1)
WHERE "classId" IS NULL;

ALTER TABLE "Lesson" ALTER COLUMN "classId" SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE "Lesson"
    ADD CONSTRAINT "Lesson_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "Class"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Attendance: gộp trạng thái cũ → PRESENT / ABSENT
UPDATE "Attendance" SET "status" = 'ABSENT'
WHERE "status" IN ('EXCUSED', 'UNEXCUSED');

UPDATE "Attendance" SET "status" = 'PRESENT'
WHERE "status" = 'LATE';

ALTER TABLE "Attendance" DROP COLUMN IF EXISTS "lateMinutes";

-- 3. MonthlyReport: excused + unexcused → absentCount
ALTER TABLE "MonthlyReport" ADD COLUMN IF NOT EXISTS "absentCount" INTEGER;

UPDATE "MonthlyReport"
SET "absentCount" = COALESCE("excusedCount", 0) + COALESCE("unexcusedCount", 0)
WHERE "absentCount" IS NULL;

UPDATE "MonthlyReport" SET "absentCount" = 0 WHERE "absentCount" IS NULL;

ALTER TABLE "MonthlyReport" ALTER COLUMN "absentCount" SET NOT NULL;

ALTER TABLE "MonthlyReport" DROP COLUMN IF EXISTS "excusedCount";
ALTER TABLE "MonthlyReport" DROP COLUMN IF EXISTS "unexcusedCount";

-- 4. Student: bỏ gán ca (quản lý qua lớp + TKB)
ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_shiftId_fkey";
ALTER TABLE "Student" DROP COLUMN IF EXISTS "shiftId";
