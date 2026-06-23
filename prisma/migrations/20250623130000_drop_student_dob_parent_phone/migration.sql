-- Bỏ ngày sinh và SĐT phụ huynh khỏi học sinh
ALTER TABLE "Student" DROP COLUMN IF EXISTS "dateOfBirth";
ALTER TABLE "Student" DROP COLUMN IF EXISTS "parentPhone";
