import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

export function Map({ center, height }: { center: [number, number], height: string }) {
  
  function UpdateMapCenter() {
    const map = useMap()
    useEffect(() => {
      map.setView(center, map.getZoom())
    }, [center]);
    return null;
  }
  
  return (
    <div style={{ height }}>
      <MapContainer
        style={{
          height: "100%",
        }}
        center={center}
        zoom={13}>
        <UpdateMapCenter />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} />
      </MapContainer>
    </div>
  );
}
