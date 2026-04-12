const SimpleHorizontalBarChart = ({
  data,
  color = "#63D4A6",
  formatValue = (value) => value.toLocaleString(),
  emptyLabel = "No data available",
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const values = safeData.map((item) => Number(item.value) || 0);
  const maxValue = Math.max(...values, 0);
  const hasData = values.some((value) => value > 0);

  if (!safeData.length || !hasData) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-gray-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {safeData.map((item) => {
        const value = Number(item.value) || 0;
        const widthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;

        return (
          <div key={item.label} className="grid grid-cols-[minmax(120px,180px)_1fr_auto] items-center gap-3">
            <span className="truncate text-sm text-slate-600">{item.label}</span>
            <div className="h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(widthPercent, value > 0 ? 4 : 0)}%`,
                  backgroundColor: color,
                }}
                title={`${item.label}: ${formatValue(value)}`}
              />
            </div>
            <span className="text-sm font-medium text-slate-700">{formatValue(value)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default SimpleHorizontalBarChart;
