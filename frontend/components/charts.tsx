"use client";

import { motion } from "framer-motion";

export function LineChart() {
  const points = [20, 45, 30, 60, 55, 80, 70, 90, 85, 95];
  const width = 300;
  const height = 150;
  const padding = 20;
  
  const xScale = (i: number) => padding + (i / (points.length - 1)) * (width - 2 * padding);
  const yScale = (v: number) => height - padding - (v / 100) * (height - 2 * padding);
  
  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p)}`)
    .join(" ");

  return (
    <div className="w-full max-w-[300px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {}
        {[0, 25, 50, 75, 100].map((tick) => (
          <line
            key={tick}
            x1={padding}
            y1={yScale(tick)}
            x2={width - padding}
            y2={yScale(tick)}
            stroke="#262626"
            strokeWidth="1"
          />
        ))}
        
        {}
        <motion.path
          d={pathData}
          fill="none"
          stroke="#00ff88"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={xScale(i)}
            cy={yScale(p)}
            r="3"
            fill="#00ff88"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2 font-mono text-xs text-muted-foreground">
        <span>MATCH 1</span>
        <span>MATCH 10</span>
      </div>
    </div>
  );
}

export function BarChart() {
  const data = [
    { team: "ARS", points: 56 },
    { team: "MCI", points: 50 },
    { team: "MUN", points: 47 },
    { team: "LIV", points: 45 },
    { team: "TOT", points: 42 },
  ];
  
  const maxPoints = Math.max(...data.map(d => d.points));
  const barHeight = 24;
  const gap = 12;
  
  return (
    <div className="w-full max-w-[300px]">
      <svg viewBox={`0 0 300 ${data.length * (barHeight + gap)}`} className="w-full">
        {data.map((d, i) => {
          const y = i * (barHeight + gap);
          const barWidth = (d.points / maxPoints) * 200;
          
          return (
            <g key={d.team}>
              {}
              <text
                x="0"
                y={y + barHeight / 2 + 4}
                fill="#737373"
                fontSize="11"
                fontFamily="var(--font-jetbrains-mono)"
              >
                {d.team}
              </text>
              
              {}
              <rect
                x="40"
                y={y}
                width="220"
                height={barHeight}
                fill="#1a1a1a"
              />
              
              {}
              <motion.rect
                x="40"
                y={y}
                width={barWidth}
                height={barHeight}
                fill={i === 0 ? "#00ff88" : i === 1 ? "#0088ff" : "#737373"}
                initial={{ width: 0 }}
                animate={{ width: barWidth }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
              />
              
              {}
              <motion.text
                x={45 + barWidth}
                y={y + barHeight / 2 + 4}
                fill="#fafafa"
                fontSize="10"
                fontFamily="var(--font-jetbrains-mono)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {d.points}
              </motion.text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function MiniChart({ data, color = "#00ff88" }: { data: number[]; color?: string }) {
  const width = 120;
  const height = 40;
  const padding = 4;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const xScale = (i: number) => padding + (i / (data.length - 1)) * (width - 2 * padding);
  const yScale = (v: number) => height - padding - ((v - min) / range) * (height - 2 * padding);
  
  const pathData = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />
    </svg>
  );
}
