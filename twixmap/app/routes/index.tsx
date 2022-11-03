import type { LinksFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useEffect, useState } from "react";

import { ClientOnly } from "remix-utils";
import { Map } from "~/components/map.client";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.9.2/dist/leaflet.css",
  },
];

export default function Index() {
  const [getCenter, setCenter] = useState<[number, number]>([0, 0])
  
  function setCenterFromForm(event: any) {
    const lat = event.currentTarget.lat.value
    const lng = event.currentTarget.lng.value
    setCenter([lat, lng])
  }

  function setCenterFromGeo() {
    navigator.geolocation.getCurrentPosition((position) => {
      setCenter([position.coords.latitude, position.coords.longitude]);
    } , (error) => {
      // TODO error
    })
  }

  useEffect(() => {
    setCenterFromGeo();
  }, [])

  return (
    <div>
      <ClientOnly>
        {() => <Map center={getCenter} height="98vh" />}
      </ClientOnly>
      <div style={{ position: 'absolute', top: '0', right: '0', padding: '16px', zIndex: '1000' }}>
        <div style={{ backgroundColor: 'white', padding: '16px' }}>
          <Form onSubmit={setCenterFromForm}>
            <div>
              Latitude <input type="number" name="lat" min="-90" max="90" step="0.0000001" defaultValue={getCenter[0]} />
            </div>
            <div>
              Longitute <input type="number" name="lng" min="-180" max="180" step="0.0000001" defaultValue={getCenter[1]} />
            </div>
            <div>
              <button type="submit">Trova posizione</button>
            </div>
          </Form>
          <div>
            <button onClick={() => setCenterFromGeo()}>La mia posizione</button>
          </div>
        </div>
      </div>
    </div>
  );
}
