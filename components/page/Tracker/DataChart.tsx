import { useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DataChartProps } from "../../../types/interface";

export const DataChart = ({
  data,
  type,
  color = "#00a2ff",
}: DataChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(2);
  };

  return (
    <div ref={chartRef} className="chart-container h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="rgba(197, 203, 206, 0.1)"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value, index) => {
                if (index % 4 !== 0) return "";
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              stroke="#fff"
            />
            {/* <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxis}
              width={40}
              stroke="#fff"
            /> */}
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(6)}`, "Value"]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
              }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#000",
                fontSize: "14px",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
              fill="url(#colorValue)"
            />
          </LineChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={color === "#0063F5" ? "#8B5CF6" : color}
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor={color === "#0063F5" ? "#8B5CF6" : color}
                  stopOpacity={0.3}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="rgba(197, 203, 206, 0.1)"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value, index) => {
                if (index % 4 !== 0) return "";
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              stroke="#fff"
            />
            {/* <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxis}
              width={40}
              stroke="#fff"
            /> */}
            <Tooltip
              formatter={(value: number) => [
                `${value.toLocaleString()}`,
                "Volume",
              ]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
              }}
              labelStyle={{
                color: "#000",
              }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#00a2ff",
                fontSize: "14px",
              }}
            />
            <Bar
              dataKey="value"
              fill="url(#barColor)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
