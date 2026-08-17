"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"

export type PieDatum = { name: string; value: number; color: string }

export function AttendancePie({ data }: { data: PieDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm font-semibold text-muted-foreground">
        Chưa có dữ liệu điểm danh trong khoảng thời gian này.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="48%"
          innerRadius={58}
          outerRadius={88}
          paddingAngle={3}
          cornerRadius={4}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0]
              const val = Number(item.value)
              const pct = total ? Math.round((val / total) * 100) : 0
              return (
                <div className="rounded-xl border border-border bg-card/95 p-2.5 text-xs font-semibold text-card-foreground shadow-lg backdrop-blur-md">
                  <p className="font-extrabold text-foreground">{item.name}</p>
                  <p className="text-xs font-bold text-primary mt-0.5">
                    {val} lượt <span className="font-normal text-muted-foreground">({pct}%)</span>
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          formatter={(value) => (
            <span className="text-xs font-bold text-muted-foreground">
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

