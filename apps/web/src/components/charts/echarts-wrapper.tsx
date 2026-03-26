"use client";

import { useRef, useEffect } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart, GaugeChart, ScatterChart, FunnelChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GaugeChart,
  ScatterChart,
  FunnelChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

const THEME = {
  backgroundColor: "transparent",
  textStyle: { color: "#8888aa", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 },
  title: { textStyle: { color: "#d4d4e8", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600 } },
  legend: { textStyle: { color: "#8888aa", fontSize: 10 } },
  tooltip: {
    backgroundColor: "#1e1e30",
    borderColor: "#2a2a40",
    textStyle: { color: "#d4d4e8", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 },
  },
  categoryAxis: { axisLine: { lineStyle: { color: "#2a2a40" } }, axisTick: { lineStyle: { color: "#2a2a40" } }, axisLabel: { color: "#555570" }, splitLine: { lineStyle: { color: "#1e1e30" } } },
  valueAxis: { axisLine: { lineStyle: { color: "#2a2a40" } }, axisTick: { lineStyle: { color: "#2a2a40" } }, axisLabel: { color: "#555570" }, splitLine: { lineStyle: { color: "#1e1e30" } } },
};

interface EChartsWrapperProps {
  option: EChartsOption;
  height?: number;
  className?: string;
}

export function EChartsWrapper({ option, height = 280, className }: EChartsWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chartRef.current = chart;
    chart.setOption({ ...THEME, ...option });

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [option]);

  return <div ref={ref} style={{ height }} className={className} />;
}
