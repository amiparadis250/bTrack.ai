"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMonthKey } from "@/lib/format";
import type { TrendPoint } from "@/types/analytics";

// Validated for CVD + contrast against a white chart surface (see the dataviz skill);
// the dash pattern is a secondary encoding on top of the color, not decoration.
const REVENUE_COLOR = "#008300";
const EXPENSE_COLOR = "#e34948";

function compactAmount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

export function RevenueExpenseChart({ data, currency }: { data: TrendPoint[]; currency: string }) {
  const chartData = data.map((point) => ({
    period: formatMonthKey(point.period),
    revenue: Number(point.revenue),
    expenses: Number(point.expenses),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.6} />
        <XAxis
          dataKey="period"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
          tickFormatter={compactAmount}
          width={48}
        />
        <Tooltip
          formatter={(value, name) => [`${currency} ${Number(value).toLocaleString("en-US")}`, name]}
          contentStyle={{
            borderRadius: 12,
            borderColor: "var(--color-border)",
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={REVENUE_COLOR}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke={EXPENSE_COLOR}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ r: 4 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
