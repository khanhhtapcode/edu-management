"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export type BarDatum = { label: string; rate: number }

export function AttendanceBar({ data }: { data: BarDatum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm font-semibold text-muted-foreground">
        Chưa có dữ liệu để hiển thị.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)", fontWeight: 600 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 100]}
          unit="%"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)", fontWeight: 600 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--primary)", opacity: 0.08 }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-xl border border-border bg-card/95 p-2.5 text-xs font-semibold text-card-foreground shadow-lg backdrop-blur-md">
                  <p className="font-extrabold text-foreground">{label}</p>
                  <p className="text-xs font-bold text-primary mt-0.5">
                    {payload[0].value}% <span className="font-normal text-muted-foreground">Tỷ lệ chuyên cần</span>
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey="rate"
          fill="var(--chart-1)"
          radius={[8, 8, 0, 0]}
          maxBarSize={44}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

