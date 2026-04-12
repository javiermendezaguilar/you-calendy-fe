const SimpleDonutChart = ({
  segments,
  total,
  centerLabel,
  size = 180,
  emptyLabel = "No data available",
}) => {
  const safeSegments = Array.isArray(segments) ? segments : [];
  const safeTotal = Number(total) || 0;

  if (!safeSegments.length || safeTotal <= 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-50 text-sm text-gray-500"
        style={{ width: size, height: size }}
      >
        {emptyLabel}
      </div>
    );
  }

  let current = 0;
  const gradient = safeSegments
    .map((segment) => {
      const value = Number(segment.value) || 0;
      const start = current;
      current += (value / safeTotal) * 100;
      return `${segment.color} ${start}% ${current}%`;
    })
    .join(", ");

  return (
    <div
      className="relative rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${gradient})`,
      }}
    >
      <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white text-center">
        <span className="text-2xl font-semibold text-slate-900">{safeTotal}</span>
        <span className="text-xs text-slate-500">{centerLabel}</span>
      </div>
    </div>
  );
};

export default SimpleDonutChart;
