# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## HỆ THỐNG QUẢN LÝ LỚP HỌC & HỌC SINH (EDUTRACK)

---

## 1. TỔNG QUAN HỆ THỐNG & ĐỊNH HƯỚNG GIAO DIỆN

### 1.1. Công Nghệ Sử Dụng (Tech Stack)
* **Framework:** Next.js (App Router) / React.js.
* **Styling:** Tailwind CSS.
* **UI Component Library:** `shadcn/ui` (Dựa trên Radix Primitives).
* **Database ORM:** Prisma DB.
* **Biểu đồ (Charts):** Recharts hoặc Tremor.
* **Xuất bản PDF:** `@react-pdf/renderer` hoặc thư viện tương đương ở Server-side.

### 1.2. Thiết Kế Giao Diện (Theme Education)
Hệ thống sử dụng phong cách **Education Modern** với các tông màu tạo cảm giác tin cậy, chuyên nghiệp và giảm mỏi mắt cho giáo viên khi làm việc lâu:
* **Màu chủ đạo (Primary):** `Indigo (#4f46e5)` hoặc `Emerald (#059669)` đại diện cho sự phát triển giáo dục.
* **Màu nền (Background):** `Slate-50 (#f8fafc)` hoặc `Zinc-50` tạo không gian sáng sủa, sạch sẽ.
* **Typography:** Ưu tiên font Sans-serif hiện đại (Inter, Roboto hoặc Montserrat).

---

## 2. CHI TIẾT CÁC CHỨC NĂNG HỆ THỐNG

### 2.1. Dashboard Tổng Quan (Bộ Lọc Động)

Giao diện Dashboard đóng vai trò là "bộ não" trung tâm, hiển thị báo cáo nhanh về tình hình các lớp học trong ngày/tuần/tháng hiện tại.

#### Các chỉ số chính (KPI Cards)
Hệ thống sử dụng thành phần `Card` của `shadcn/ui` hiển thị 4 chỉ số cốt lõi:
* **Tổng số học sinh:** Tổng học sinh đang có trạng thái hoạt động (`ACTIVE`).
* **Số ca học:** Số ca học được định cấu hình trên hệ thống.
* **Buổi học hôm nay:** Số lượng buổi học thực tế diễn ra trong ngày.
* **Học sinh vắng mặt:** Số học sinh vắng (Tính cả có phép và không phép) của ngày hôm nay.

#### Bộ lọc nâng cao (Advanced Dashboard Filters)
Đặt ngay trên thanh Toolbar của Dashboard, cho phép thay đổi toàn bộ số liệu thống kê bên dưới theo thời gian thực:
* **Filter Thời gian (Date Range Picker):** Lọc theo Hôm nay, Tuần này, Tháng này hoặc một khoảng ngày tùy chọn (`shadcn/ui Popover + Calendar`).
* **Filter Lớp học (Class Select):** Dropdown chọn nhanh một lớp học cụ thể để xem dữ liệu chuyên biệt.
* **Filter Ca học (Shift Select):** Phân tích dữ liệu theo từng ca trong ngày.

---

### 2.2. Phân Hệ Quản Lý Học Sinh

Hỗ trợ quản lý thông tin toàn diện của học sinh từ lúc nhập học cho đến khi kết thúc khóa học.

* **Chức năng cốt lõi:**
  * **Thêm học sinh:** Form validation đồng bộ sử dụng `react-hook-form` kết hợp thư viện `zod`.
  * **Sửa thông tin:** Gọi dữ liệu lên thành phần `Sheet` (Side Drawer) để chỉnh sửa nhanh mà không cần chuyển trang.
  * **Xóa học sinh:** Áp dụng cơ chế **Soft Delete** (Chuyển trạng thái sang `INACTIVE`) nhằm bảo toàn lịch sử điểm danh và dữ liệu báo cáo cũ.
* **Dữ liệu lưu trữ:** Họ tên, Ngày sinh, Giới tính, Số điện thoại phụ huynh, Lớp đang học, Trường học chính quy, Trạng thái học tập.
* **Tìm kiếm & Bộ lọc nâng cao:** Ô tìm kiếm hỗ trợ Debounce gõ tên hoặc lớp đến đâu lọc đến đấy, đi kèm bộ lọc phân loại nhanh theo lớp học.

---

### 2.3. Phân Hệ Quản Lý Ca Học

Linh hoạt thiết lập thời gian biểu của trung tâm hoặc lớp học để tối ưu hóa việc phân bổ lịch dạy.

* **Cấu hình ca học mẫu:**
  * Ca 1: 07h30 - 10h30
  * Ca 2: 14h30 - 16h30
  * Ca 3: 17h00 - 19h00
  * Ca 4: 19h30 - 21h30
* **Tính năng:**
  * Thêm, sửa, xóa các mốc thời gian ca học.
  * **Gán học sinh vào ca (Assigning):** Giao diện danh sách học sinh tích hợp checkbox, cho phép gán nhanh một hoặc nhiều học sinh vào một ca học cố định.
  * **Xem danh sách theo ca:** Bộ lọc nhanh hiển thị tức thì danh sách học sinh thuộc ca được chọn.

---

### 2.4. Phân Hệ Điểm Danh Buổi Học

Giao diện tối ưu hóa cho thao tác "Một chạm" (One-tap selection), phù hợp tốt trên cả máy tính bảng và máy tính xách tay của giáo viên.

* **Quy trình hoạt động:** Khi giáo viên mở một buổi học bất kỳ, hệ thống tự động tải (load) danh sách tất cả học sinh đã được gán vào ca học đó.
* **Trạng thái điểm danh (Sử dụng Badge hoặc Radio Toggle):**
  * `Có mặt` (Màu xanh lá - Emerald)
  * `Vắng có phép` (Màu xanh dương - Sky)
  * `Vắng không phép` (Màu đỏ - Rose)
  * `Đi muộn` (Màu vàng - Amber) -> Kèm ô nhập số phút đi muộn (Ví dụ: Muộn 15 phút).
* **Lưu trữ:** Toàn bộ lịch sử điểm danh được ghi nhận chính xác theo ngày. Cho phép xem lại lịch sử thông qua giao diện Calendar lịch tháng.

---

### 2.5. Phân Hệ Nhật Ký Bài Học & Nhận Xét

Nơi giáo viên ghi nhận tiến độ giảng dạy chung của lớp và đánh giá chi tiết cho từng cá nhân sau mỗi buổi học.

#### Nội dung bài học (Chung cho ca học):
* Chủ đề bài học (Topic).
* Kiến thức trọng tâm (Key Concepts).
* Bài tập đã luyện tập tại lớp.
* Bài tập về nhà đã giao.

#### Đánh giá cá nhân (Riêng cho từng học sinh):
Giao diện dạng bảng (Inline-editable Table), giáo viên có thể dùng phím `Tab` để chuyển nhanh giữa các ô nhập liệu của học sinh:
* Mức độ tập trung (Thang điểm 1-5 hoặc Tiêu chí: Tốt, Khá, Trung bình, Yếu).
* Thái độ học tập & Khả năng tiếp thu kiến thức.
* Điểm mạnh & Điểm cần cải thiện.

---

### 2.6. Phân Hệ Báo Cáo, Thống Kê & Xuất Bản PDF

#### Thống kê hệ thống
* Biểu thị tỷ lệ chuyên cần (%) của từng học sinh hoặc toàn lớp dưới dạng biểu đồ tròn (Pie Chart) hoặc biểu đồ cột (Bar Chart) trực quan qua thư viện Recharts.
* Cho phép xuất dữ liệu thô ra file **Excel** để quản lý nội bộ.

#### Quy trình xuất phiếu báo cáo tháng chuyên nghiệp gửi phụ huynh
Giáo viên chọn `Học sinh` + `Tháng tổng kết` -> Hệ thống tự động truy vấn dữ liệu từ Prisma và điền vào mẫu biểu báo cáo PDF chuẩn hóa để tải xuống và in ấn trực tiếp.

**Nội dung chi tiết trên file PDF:**
1. **Thông tin học sinh:** Họ tên, Lớp đang học, Tháng làm báo cáo, Logo Trung tâm/Lớp học.
2. **Thống kê chuyên cần:** Tổng số buổi học trong tháng, Số buổi có mặt, Số buổi vắng (có phép/không phép), Tỷ lệ chuyên cần (%).
3. **Nội dung đã học trong tháng:** Tổng hợp tất cả các chủ đề, kiến thức cốt lõi và các dạng bài tập đã được luyện tập trong tháng đó.
4. **Đánh giá học tập:** Bảng điểm hoặc biểu đồ radar đánh giá các tiêu chí (Tiếp thu, Tập trung, Tinh thần học, Kỹ năng làm bài, Điểm mạnh, Điểm cần cải thiện).
5. **Kết quả bài tập:** Tỷ lệ hoàn thành bài tập về nhà (%), Nhận xét chất lượng làm bài.
6. **Nhận xét của giáo viên:** Ô nhập văn bản tự do (Rich Text hoặc Textarea) để giáo viên viết lời khuyên, tổng kết cuối tháng.

**Tính năng bổ sung nâng cao:**
* **Xuất PDF 1-Click:** Render trực tiếp file PDF chuyên nghiệp, độ nét cao, định dạng chuẩn A4 để tải xuống máy tính hoặc thiết bị di động.
* **Tùy biến Logo:** Hỗ trợ upload file ảnh logo của lớp học lên header của PDF.
* **Nhật ký lưu trữ:** Lưu trữ lịch sử các bản báo cáo tháng đã xuất trong hệ thống để quản lý và xem lại khi cần.

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU (PRISMA SCHEMA)

```prisma
datasource db {
  provider = "postgresql" // Hoặc "mysql" tùy theo hạ tầng hệ thống của bạn
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. Quản lý Lớp học chính quy
model Class {
  id          String    @id @default(cuid())
  name        String    // Ví dụ: Toán 10A1, Luyện đề Đại Học...
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  students    Student[]
}

// 2. Quản lý Ca học cố định
model Shift {
  id          String    @id @default(cuid())
  name        String    // Ví dụ: Ca 1, Ca 2
  startTime   String    // Định dạng "07:30"
  endTime     String    // Định dạng "10:30"
  createdAt   DateTime  @default(now())
  lessons     Lesson[]  
}

// 3. Quản lý Học sinh
model Student {
  id          String    @id @default(cuid())
  fullName    String
  dateOfBirth DateTime
  gender      String?
  parentPhone String    // Số điện thoại phụ huynh
  schoolName  String?   // Trường học chính quy của học sinh
  status      String    @default("ACTIVE") // ACTIVE, RESERVED, INACTIVE
  classId     String
  class       Class     @relation(fields: [classId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  attendances Attendance[]
  comments    StudentComment[]
  reports     MonthlyReport[]
}

// 4. Quản lý một Buổi học cụ thể theo lịch thực tế
model Lesson {
  id            String    @id @default(cuid())
  date          DateTime  @default(now()) // Ngày diễn ra buổi học thực tế
  shiftId       String
  shift         Shift     @relation(fields: [shiftId], references: [id])
  
  // Nội dung bài học chung của cả ca học ngày hôm đó
  topic         String    // Chủ đề bài học
  coreKnowledge String    @db.Text // Kiến thức trọng tâm
  classWork     String?   @db.Text // Bài tập đã luyện tập tại lớp
  homework      String?   @db.Text // Bài tập về nhà giao về

  createdAt     DateTime  @default(now())
  attendances   Attendance[]
  comments      StudentComment[]
}

// 5. Chi tiết điểm danh từng học sinh trong một buổi học
model Attendance {
  id          String   @id @default(cuid())
  lessonId    String
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  studentId   String
  student     Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  status      String   // PRESENT (Có mặt), EXCUSED (Vắng có phép), UNEXCUSED (Vắng không phép), LATE (Đi muộn)
  lateMinutes Int      @default(0) // Số phút đi muộn nếu status là LATE
  updatedAt   DateTime @updatedAt

  @@unique([lessonId, studentId]) // Tránh trùng lặp điểm danh một học sinh 2 lần trong 1 buổi
}

// 6. Nhận xét chi tiết từng học sinh trong một buổi học
model StudentComment {
  id            String   @id @default(cuid())
  lessonId      String
  lesson        Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  focusScore    Int      @default(5) // Thang điểm tập trung từ 1 đến 5
  attitude      String   @db.Text    // Thái độ học tập
  reception     String   @db.Text    // Khả năng tiếp thu bài
  improvement   String?  @db.Text    // Điểm học sinh cần cải thiện

  @@unique([lessonId, studentId])
}

// 7. Phiếu Báo Cáo Tổng Kết Tháng để xuất PDF
model MonthlyReport {
  id              String   @id @default(cuid())
  studentId       String
  student         Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  reportMonth     String   // Định dạng "YYYY-MM" để phân loại theo tháng năm
  
  // Dữ liệu snapshot thống kê cố định tại thời điểm xuất báo cáo
  totalLessons    Int
  presentCount    Int
  excusedCount    Int
  unexcusedCount  Int
  attendanceRate  Float
  
  homeworkCompletionRate Float // Tỷ lệ hoàn thành BTVN (%)
  homeworkComment       String @db.Text
  
  teacherReview   String   @db.Text // Ô giáo viên nhập nhận xét tự do tổng kết cuối tháng
  pdfUrl          String?  // Đường dẫn hoặc định danh lưu trữ file PDF cục bộ/cloud để tải lại nhanh
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([studentId, reportMonth])
}
4. QUY ĐỊNH THÀNH PHẦN GIAO DIỆN (UI COMPONENT MAPPING WITH SHADCN/UI)Tính năng màn hìnhComponent của shadcn/ui khuyến nghịGhi chú UXBảng danh sách học sinh<DataTable />Tích hợp sẵn Pagination, Sorting và Filter nhanh trên header của cột.Form Thêm/Sửa nhanh<Sheet /> hoặc <Dialog />Mở từ cạnh phải màn hình (Sheet), giữ nguyên trạng thái trang hiện tại giúp thao tác liên tục không gián đoạn.Chọn Trạng thái điểm danh<RadioGroup /> hoặc Custom <Button />Thiết kế dạng nút bấm to kiểu Toggle bọc màu trạng thái để click nhanh chỉ với một chạm.Chọn Tháng xuất báo cáo<Select /> kết hợp <Popover />Đơn giản hóa việc chọn "Tháng 05/2026", "Tháng 06/2026" một cách đồng bộ.Biểu đồ chuyên cầnCard chứa biểu đồ từ thư viện RechartsThiết kế bo tròn góc chuẩn modern, đổ bóng mờ (shadow-sm) tạo chiều sâu.