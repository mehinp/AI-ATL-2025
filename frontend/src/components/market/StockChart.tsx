import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartRange = "1W" | "1M" | "ALL";

interface DataPoint {
  time: string;
  price: number;
  timestamp?: number | null;
}

interface StockChartProps {
  teamName: string;
  data: DataPoint[];
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
  price: number;
  weekChangePercent?: number | null;
  monthChangePercent?: number | null;
  priceDomain?: [number, number];
}

type SelectionRange = { start: DataPoint; end: DataPoint };

const ranges: ChartRange[] = ["1W", "1M", "ALL"];
const PLACEHOLDER = "\u2014";
const chartMargins = { top: 20, right: 24, bottom: 24, left: 12 };
const priceLabelHeight = 28;
const priceLabelWidth = 88;
const dateLabelHeight = 26;
const dateLabelWidth = 120;
const selectionBadgeHeight = 36;
const DEFAULT_PRICE_DOMAIN: [number, number] = [0, 250];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);

const formatPercent = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) return PLACEHOLDER;
  const formatted = Math.abs(value).toFixed(2);
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatted}%`;
};

export default function StockChart({
  teamName,
  data,
  range,
  onRangeChange,
  price,
  weekChangePercent,
  monthChangePercent,
  priceDomain,
}: StockChartProps) {
  const gradientId = "priceGradient";
  const [activePoint, setActivePoint] = useState<DataPoint | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setChartSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isDragging) return;
    const previous = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.userSelect = previous;
    };
  }, [isDragging]);

  const latestPoint = data[data.length - 1];
  const displayPoint = activePoint ?? latestPoint;
  const displayPrice = displayPoint?.price ?? price;
  const displayTime = displayPoint?.timestamp
    ? new Date(displayPoint.timestamp).toLocaleString()
    : new Date().toLocaleString();

  const domain = useMemo<[number, number]>(() => {
    if (priceDomain && priceDomain[0] !== priceDomain[1]) {
      return priceDomain;
    }
    return DEFAULT_PRICE_DOMAIN;
  }, [priceDomain]);
  const [domainMin, domainMax] =
    domain[0] <= domain[1] ? domain : DEFAULT_PRICE_DOMAIN;

  const crosshairLines = useMemo(() => {
    if (!displayPoint) return null;
    return (
      <>
        <ReferenceLine
          x={displayPoint.time}
          stroke="rgba(255,255,255,0.35)"
          strokeDasharray="3 3"
          ifOverflow="extendDomain"
        />
        <ReferenceLine
          y={displayPoint.price}
          stroke="rgba(255,255,255,0.35)"
          strokeDasharray="3 3"
          ifOverflow="extendDomain"
        />
      </>
    );
  }, [displayPoint]);

  const showSelectionBadge =
    selectionRange && !isSameSelection(selectionRange) && chartSize.width > 0;

  const selectionDiff = useMemo(() => {
    if (!selectionRange || isSameSelection(selectionRange)) return null;
    const startPrice = selectionRange.start.price;
    const endPrice = selectionRange.end.price;
    if (!startPrice || !endPrice) return null;
    const change = endPrice - startPrice;
    const percent = startPrice ? (change / startPrice) * 100 : 0;
    return { change, percent };
  }, [selectionRange]);

  const selectionTimes = useMemo(() => {
    if (!selectionRange || isSameSelection(selectionRange)) return null;
    return {
      start: selectionRange.start.time,
      end: selectionRange.end.time,
    };
  }, [selectionRange]);

  const clearSelection = () => setSelectionRange(null);

  return (
    <Card className="p-6" data-testid="stock-chart">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{teamName}</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold tracking-tight">
                {formatPrice(displayPrice)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Updated {displayTime}</div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">1W</p>
              <p
                className={`font-medium ${
                  (weekChangePercent ?? 0) >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {formatPercent(weekChangePercent)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">1M</p>
              <p
                className={`font-medium ${
                  (monthChangePercent ?? 0) >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {formatPercent(monthChangePercent)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {ranges.map((tf) => (
            <Button
              key={tf}
              variant={range === tf ? "default" : "ghost"}
              size="sm"
              onClick={() => onRangeChange(tf)}
              className="px-4"
            >
              {tf}
            </Button>
          ))}
        </div>

        <div ref={chartRef} className="relative h-80 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={chartMargins}
              onMouseMove={(state) => {
                const payload = state?.activePayload?.[0]?.payload as DataPoint | undefined;
                setActivePoint(payload ?? null);
                if (
                  payload &&
                  typeof state?.chartX === "number" &&
                  typeof state?.chartY === "number"
                ) {
                  setCursorCoords({
                    x: state.chartX,
                    y: state.chartY,
                  });
                  if (isDragging) {
                    setSelectionRange((prev) => {
                      if (!payload) return prev;
                      if (!prev) return { start: payload, end: payload };
                      return { ...prev, end: payload };
                    });
                  }
                } else {
                  setCursorCoords(null);
                }
              }}
              onMouseLeave={() => {
                setActivePoint(null);
                setCursorCoords(null);
                if (isDragging) {
                  setIsDragging(false);
                  setSelectionRange((prev) => {
                    if (!prev || !isSameSelection(prev)) return prev;
                    return null;
                  });
                }
              }}
              onMouseDown={(state) => {
                const payload = state?.activePayload?.[0]?.payload as DataPoint | undefined;
                if (!payload) return;
                setIsDragging(true);
                setSelectionRange({ start: payload, end: payload });
              }}
              onMouseUp={() => {
                setIsDragging(false);
                setSelectionRange((prev) => {
                  if (!prev || !isSameSelection(prev)) return prev;
                  return null;
                });
              }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="90%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => formatPrice(value).replace("$", "")}
                tickLine={false}
                axisLine={false}
                domain={[domainMin, domainMax]}
                width={60}
              />
              <Tooltip cursor={{ stroke: "transparent" }} content={() => null} />
          {crosshairLines}
          {selectionRange && !isSameSelection(selectionRange) && (
            <>
              <ReferenceLine
                x={selectionRange.start.time}
                stroke="rgba(255,255,255,0.4)"
                strokeDasharray="2 2"
                ifOverflow="extendDomain"
              />
              <ReferenceLine
                x={selectionRange.end.time}
                stroke="rgba(255,255,255,0.4)"
                strokeDasharray="2 2"
                ifOverflow="extendDomain"
              />
            </>
          )}
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          {displayPoint && chartSize.width > 0 && chartSize.height > 0 && (
            <>
              <div
                className="pointer-events-none absolute left-0"
                style={{
                  top: priceBadgeTop(displayPoint.price, chartSize.height, domainMin, domainMax),
                }}
              >
                <AxisBadge width={priceLabelWidth} height={priceLabelHeight}>
                  {formatPrice(displayPoint.price)}
                </AxisBadge>
              </div>
              {cursorCoords && (
                <div
                  className="pointer-events-none absolute bottom-0"
                  style={{
                    left: clamp(
                      chartMargins.left + cursorCoords.x - dateLabelWidth / 2,
                      0,
                      chartSize.width - dateLabelWidth,
                    ),
                  }}
                >
                  <AxisBadge width={dateLabelWidth} height={dateLabelHeight}>
                    {displayPoint.time}
                  </AxisBadge>
                </div>
              )}
            </>
          )}
          {showSelectionBadge && selectionDiff && selectionTimes && (
            <div
              className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-background/95 px-4 text-sm shadow-lg"
              style={{ top: chartMargins.top, minHeight: selectionBadgeHeight }}
            >
              <span
                className={`font-semibold ${
                  selectionDiff.change >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {`${selectionDiff.change >= 0 ? "+" : ""}${formatPrice(Math.abs(selectionDiff.change))}`}{" "}
                ({formatPercent(selectionDiff.percent)})
              </span>
              <span className="text-xs text-muted-foreground">
                {selectionTimes.start} → {selectionTimes.end}
              </span>
              {!isDragging && (
                <button
                  type="button"
                  className="pointer-events-auto text-xs text-muted-foreground hover:text-foreground"
                  onClick={clearSelection}
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface AxisBadgeProps {
  width: number;
  height: number;
  children: ReactNode;
}

function AxisBadge({ width, height, children }: AxisBadgeProps) {
  return (
    <div
      className="flex items-center justify-center rounded-md border bg-background px-3 text-xs font-mono font-semibold shadow-sm"
      style={{ minWidth: width, height }}
    >
      {children}
    </div>
  );
}

const isSameSelection = (range: SelectionRange | null) => {
  if (!range) return true;
  const startKey = range.start.timestamp ?? range.start.time;
  const endKey = range.end.timestamp ?? range.end.time;
  return startKey === endKey && range.start.price === range.end.price;
};

const priceBadgeTop = (
  price: number,
  containerHeight: number,
  domainMin: number,
  domainMax: number,
) => {
  const min = Math.min(domainMin, domainMax);
  const max = Math.max(domainMin, domainMax);
  const clampedPrice = clamp(price, min, max);
  const usableHeight = Math.max(
    0,
    containerHeight - chartMargins.top - chartMargins.bottom - priceLabelHeight,
  );
  if (usableHeight === 0 || max === min) {
    return chartMargins.top;
  }
  const ratio = (clampedPrice - min) / (max - min);
  const y = chartMargins.top + (1 - ratio) * usableHeight;
  return clamp(y, chartMargins.top, containerHeight - chartMargins.bottom - priceLabelHeight);
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
