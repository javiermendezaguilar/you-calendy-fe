const buildTicks = (maxValue, tickCount) => {
  if (maxValue <= 0) {
    return Array.from({ length: tickCount + 1 }, (_, index) => tickCount - index);
  }

  return Array.from({ length: tickCount + 1 }, (_, index) => {
    const rawValue = (maxValue * (tickCount - index)) / tickCount;
    return Math.round(rawValue);
  });
};

const SimpleVerticalBarChart = ({
  data,
  height = 320,
  color = "#6366F1",
  tickCount = 4,
  minColumnWidth = 36,
  formatValue = (value) => value.toLocaleString(),
  emptyLabel = "No data available",
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const values = safeData.map((item) => Number(item.value) || 0);
  const maxValue = Math.max(...values, 0);
  const ticks = buildTicks(maxValue, tickCount);
  const hasData = values.some((value) => value > 0);

  if (!safeData.length || !hasData) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60 text-sm text-gray-500"
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-4">
        <div className="flex h-full w-10 flex-col justify-between text-xs text-slate-400">
          {ticks.map((tick, index) => (
            <span key={`${tick}-${index}`}>{formatValue(tick)}</span>
          ))}
        </div>
        <div className="flex-1 overflow-x-auto">
          <div
            className="relative min-w-full"
            style={{ minWidth: `${safeData.length * minColumnWidth}px`, height }}
          >
            <div className="absolute inset-0 flex flex-col justify-between">
              {ticks.map((_, index) => (
                <div
                  key={`grid-${index}`}
                  className="border-t border-dashed border-slate-200"
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-end gap-2 px-2 pb-8">
              {safeData.map((item) => {
                const value = Number(item.value) || 0;
                const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;

                return (
                  <div
                    key={item.label}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end"
                    title={`${item.label}: ${formatValue(value)}`}
                  >
                    <div className="relative flex h-full w-full items-end justify-center">
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${Math.max(heightPercent, value > 0 ? 4 : 0)}%`,
                          backgroundColor: color,
                          maxWidth: "36px",
                        }}
                      />
                    </div>
                    <span className="mt-2 line-clamp-1 text-center text-xs text-slate-500">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleVerticalBarChart;
