import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix de iconos en Vite (para que se vean los pines)
const defaultIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPick({ lat, lng });
    },
  });
  return null;
}

/**
 * props:
 *  - value: {lat, lng} | null
 *  - onChange: (coords) => void
 *  - height?: string (e.g. "350px")
 */
export default function MapPicker({ value, onChange, height = "350px" }) {
  // centro por defecto: Ciudad de Guatemala
  const defaultCenter = useMemo(() => ({ lat: 14.6349, lng: -90.5069 }), []);
  const [pos, setPos] = useState(value || defaultCenter);

  useEffect(() => {
    if (value?.lat && value?.lng) setPos(value);
  }, [value]);

  const handlePick = ({ lat, lng }) => {
    setPos({ lat, lng });
    onChange?.({ lat, lng });
  };

  return (
    <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      <MapContainer
        center={[pos.lat, pos.lng]}
        zoom={13}
        style={{ width: "100%", height }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[pos.lat, pos.lng]} />
        <ClickHandler onPick={handlePick} />
      </MapContainer>
    </div>
  );
}
