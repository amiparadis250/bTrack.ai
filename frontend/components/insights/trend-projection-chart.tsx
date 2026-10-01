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
import type { Projection } from "@/types/insight";

// Same validated hues as the dashboard's revenue/expense chart -- the dashed
// "projected" line is the same color, signaling continuation, not a new series.
const REVENUE_COLOR = "#008300";
const EXPENSE_COLOR = "#e34948";

function compactAmount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

function nextMonthKey(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const next = new Date(Date.UTC(year, month, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function TrendProjectionChart({ projection, currency }: { projection: Projection; currency: string }) {
  const chartData = projection.history.map((point, index) => {
    const isLast = index === projection.history.length - 1;
    return {
      period: formatMonthKey(point.period),
      revenueActual: Number(point.revenue),
      expensesActual: Number(point.expenses),
      revenueProjected: isLast && projection.has_enough_data ? Number(point.revenue) : null,
      expensesProjected: isLast && projection.has_enough_data ? Number(point.expenses) : null,
    };
  });

  if (projection.has_enough_data && projection.projected_revenue !== null && projection.projected_expenses !== null) {
    const lastPeriod = projection.history[projection.history.length - 1]?.period;
    chartData.push({
      period: lastPeriod ? `${formatMonthKey(nextMonthKey(lastPeriod))} (est.)` : "Next month (est.)",
      revenueActual: null as unknown as number,
      expensesActual: null as unknown as number,
      revenueProjected: Number(projection.projected_revenue),
      expensesProjected: Number(projection.projected_expenses),
    });
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.6} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
          tickFormatter={compactAmount}
          width={48}
        />
        <Tooltip
          formatter={(value, name) => [`${currency} ${Number(value).toLocaleString("en-US")}`, name]}
          contentStyle={{ borderRadius: 12, borderColor: "var(--color-border)", fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line type="monotone" dataKey="revenueActual" name="Revenue" stroke={REVENUE_COLOR} strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
        <Line
          type="monotone"
          dataKey="revenueProjected"
          name="Revenue (projected)"
          stroke={REVENUE_COLOR}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ r: 4 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="expensesActual"
          name="Expenses"
          stroke={EXPENSE_COLOR}
          strokeWidth={2}
          dot={{ r: 4 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="expensesProjected"
          name="Expenses (projected)"
          stroke={EXPENSE_COLOR}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
