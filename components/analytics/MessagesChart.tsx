"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  inbound: number;
  outbound: number;
}

interface MessagesChartProps {
  data: DataPoint[];
}

export function MessagesChart({ data }: MessagesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00B85F" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00B85F" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
          formatter={(value: number, name: string) => [value, name === "inbound" ? "Reçus" : "Envoyés"]}
        />
        <Legend
          formatter={(value) => (value === "inbound" ? "Reçus" : "Envoyés")}
          wrapperStyle={{ fontSize: "12px" }}
        />
        <Area type="monotone" dataKey="inbound" stroke="#00B85F" strokeWidth={2} fill="url(#inboundGrad)" />
        <Area type="monotone" dataKey="outbound" stroke="#3B82F6" strokeWidth={2} fill="url(#outboundGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
