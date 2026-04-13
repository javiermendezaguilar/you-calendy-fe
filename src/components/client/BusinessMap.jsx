import React, { memo, useMemo } from 'react';

const DEFAULT_COORDINATES = [37.7749, -122.4194];
const MAP_DELTA = 0.005;

const normalizeCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return DEFAULT_COORDINATES;
  }

  const [latitude, longitude] = coordinates.map((value) => Number(value));

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return DEFAULT_COORDINATES;
  }

  return [
    Math.min(90, Math.max(-90, latitude)),
    Math.min(180, Math.max(-180, longitude)),
  ];
};

const BusinessMap = ({ coordinates }) => {
  const [latitude, longitude] = useMemo(
    () => normalizeCoordinates(coordinates),
    [coordinates]
  );

  const embedSrc = useMemo(() => {
    const bbox = [
      longitude - MAP_DELTA,
      latitude - MAP_DELTA,
      longitude + MAP_DELTA,
      latitude + MAP_DELTA,
    ].join(',');

    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`;
  }, [latitude, longitude]);

  const mapsHref = useMemo(
    () => `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`,
    [latitude, longitude]
  );

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-[#F7F7F8]">
      <iframe
        title="Business location map"
        src={embedSrc}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent p-3" />
      <a
        href={mapsHref}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[#343a40] shadow-sm transition hover:bg-white"
      >
        Open map
      </a>
    </div>
  );
};

export default memo(BusinessMap);
