import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";

export function Map({ center, height, points }: { center: [number, number], height: string, points: { name: string, position: [number, number] }[] }) {

  function UpdateMapCenter() {
    const map = useMap()
    useEffect(() => {
      map.setView(center, map.getZoom())
    }, [center]);
    return null;
  }

  function MultipleMarkers() {
    return <>{
      points.map((p, index) => {
        return (
          <Marker key={index} position={p.position}>
            <Popup>
              {p.name}
            </Popup>
          </Marker>
        )
      })
    }</>
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
        <MultipleMarkers />
      </MapContainer>
    </div>
  );
}