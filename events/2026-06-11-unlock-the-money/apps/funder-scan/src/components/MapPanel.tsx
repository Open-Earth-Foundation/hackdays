"use client";

import dynamic from "next/dynamic";

const ChoroplethMap = dynamic(() => import("./ChoroplethMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 460,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4fd",
        color: "#7a7b9a",
      }}
    >
      Loading map…
    </div>
  ),
});

export default function MapPanel(props: {
  url: string;
  mode: "national" | "losrios";
  height?: number;
}) {
  return (
    <div className="map-shell">
      <ChoroplethMap {...props} />
    </div>
  );
}
