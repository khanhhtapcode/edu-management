import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf,
} from "@react-pdf/renderer"
import { formatMonth, formatDate } from "@/lib/utils"
import { getAppLogoDataUrl } from "@/lib/app-logo"

let fontsRegistered = false
function registerFonts() {
  if (fontsRegistered) return
  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/vietnamese-400-normal.ttf",
        fontWeight: 400,
      },
      {
        src: "https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/vietnamese-500-normal.ttf",
        fontWeight: 500,
      },
      {
        src: "https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/vietnamese-700-normal.ttf",
        fontWeight: 700,
      },
    ],
  })
  fontsRegistered = true
}

export type ReportPdfData = {
  studentName: string
  className: string
  parentPhone: string
  reportMonth: string
  totalLessons: number
  presentCount: number
  excusedCount: number
  unexcusedCount: number
  lateCount: number
  attendanceRate: number
  avgFocus: number
  homeworkCompletionRate: number
  homeworkComment: string
  teacherReview: string
  topics: { date: string; topic: string; coreKnowledge: string; homework: string }[]
}

const PRIMARY = "#4f46e5"
const SLATE = "#475569"
const BORDER = "#e2e8f0"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#0f172a",
    padding: 36,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
    paddingBottom: 12,
    marginBottom: 16,
  },
  logo: { width: 120, height: 40, objectFit: "contain" },
  brand: { fontSize: 18, fontWeight: 700, color: PRIMARY },
  brandSub: { fontSize: 9, color: SLATE },
  title: {
    fontSize: 15,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  subtitle: { fontSize: 10, textAlign: "center", color: SLATE, marginBottom: 16 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: PRIMARY,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  infoRow: { flexDirection: "row", marginBottom: 3 },
  infoLabel: { width: 130, color: SLATE },
  infoValue: { flex: 1, fontWeight: 500 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statBox: {
    width: "31%",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 8,
  },
  statValue: { fontSize: 16, fontWeight: 700, color: PRIMARY },
  statLabel: { fontSize: 8, color: SLATE },
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  trLast: { flexDirection: "row" },
  th: {
    backgroundColor: "#f1f5f9",
    fontWeight: 700,
    padding: 5,
    fontSize: 9,
  },
  td: { padding: 5, fontSize: 9 },
  reviewBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 10,
    minHeight: 50,
    backgroundColor: "#f8fafc",
  },
  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  signBox: { width: "45%", alignItems: "center" },
  signLabel: { fontWeight: 700, marginBottom: 36 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: "center",
    fontSize: 8,
    color: SLATE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
})

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function ReportDocument({
  data,
  logo,
}: {
  data: ReportPdfData
  logo: string
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={logo} style={styles.logo} />
          </View>
          <View>
            <Text style={styles.brandSub}>
              Ngày xuất: {formatDate(new Date())}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Phiếu báo cáo học tập</Text>
        <Text style={styles.subtitle}>{formatMonth(data.reportMonth)}</Text>

        {/* Thông tin học sinh */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin học sinh</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên:</Text>
            <Text style={styles.infoValue}>{data.studentName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lớp đang học:</Text>
            <Text style={styles.infoValue}>{data.className}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SĐT phụ huynh:</Text>
            <Text style={styles.infoValue}>{data.parentPhone}</Text>
          </View>
        </View>

        {/* Thống kê chuyên cần */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê chuyên cần</Text>
          <View style={styles.statGrid}>
            <Stat value={String(data.totalLessons)} label="Tổng số buổi" />
            <Stat value={String(data.presentCount)} label="Có mặt (gồm đi muộn)" />
            <Stat value={String(data.lateCount)} label="Số buổi đi muộn" />
            <Stat value={String(data.excusedCount)} label="Vắng có phép" />
            <Stat value={String(data.unexcusedCount)} label="Vắng không phép" />
            <Stat value={`${data.attendanceRate}%`} label="Tỷ lệ chuyên cần" />
          </View>
        </View>

        {/* Đánh giá học tập */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá học tập</Text>
          <View style={styles.statGrid}>
            <Stat value={`${data.avgFocus}/5`} label="Mức độ tập trung TB" />
            <Stat
              value={`${data.homeworkCompletionRate}%`}
              label="Hoàn thành BTVN"
            />
            <Stat value={`${data.attendanceRate}%`} label="Chuyên cần" />
          </View>
          {data.homeworkComment ? (
            <Text style={{ marginTop: 6 }}>
              <Text style={{ fontWeight: 700 }}>Nhận xét bài tập: </Text>
              {data.homeworkComment}
            </Text>
          ) : null}
        </View>

        {/* Nội dung đã học */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung đã học trong tháng</Text>
          {data.topics.length === 0 ? (
            <Text style={{ color: SLATE }}>Chưa có buổi học nào.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tr}>
                <Text style={[styles.th, { width: "18%" }]}>Ngày</Text>
                <Text style={[styles.th, { width: "40%" }]}>Chủ đề</Text>
                <Text style={[styles.th, { width: "42%" }]}>
                  Kiến thức trọng tâm
                </Text>
              </View>
              {data.topics.map((t, i) => (
                <View
                  key={i}
                  style={i === data.topics.length - 1 ? styles.trLast : styles.tr}
                >
                  <Text style={[styles.td, { width: "18%" }]}>
                    {formatDate(t.date)}
                  </Text>
                  <Text style={[styles.td, { width: "40%" }]}>{t.topic}</Text>
                  <Text style={[styles.td, { width: "42%" }]}>
                    {t.coreKnowledge}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Nhận xét giáo viên */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhận xét của giáo viên</Text>
          <View style={styles.reviewBox}>
            <Text>{data.teacherReview || "..."}</Text>
          </View>
        </View>

        <View style={styles.signRow}>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>Phụ huynh</Text>
            <Text style={{ color: SLATE, fontSize: 8 }}>(Ký, ghi rõ họ tên)</Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>Giáo viên</Text>
            <Text style={{ color: SLATE, fontSize: 8 }}>(Ký, ghi rõ họ tên)</Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          NY MATH CLASS · Phiếu báo cáo được tạo tự động ·{" "}
          {formatMonth(data.reportMonth)}
        </Text>
      </Page>
    </Document>
  )
}

export async function generateReportPdf(data: ReportPdfData, logo?: string) {
  registerFonts()
  const resolvedLogo = logo ?? (await getAppLogoDataUrl())
  const blob = await pdf(
    <ReportDocument data={data} logo={resolvedLogo} />
  ).toBlob()
  return blob
}
