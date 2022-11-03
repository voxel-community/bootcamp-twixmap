import type { LinksFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useState } from "react";

import { ClientOnly } from "remix-utils";
import { Map } from "~/components/map.client";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.9.2/dist/leaflet.css",
  },
];

export default function Index() {
  const [getCenter, setCenter] = useState<[number, number]>([46.069345, 11.125535])
  
  function setMapCenter(event: any) {
    const lat = event.currentTarget.lat.value
    const lng = event.currentTarget.lng.value
    setCenter([lat, lng])
  }

  return (
    <div>
      <ClientOnly>
        {() => <Map center={getCenter} height="98vh" />}
      </ClientOnly>
      <div style={{ position: 'absolute', top: '0', right: '0', padding: '16px', zIndex: '1000' }}>
        <div style={{ backgroundColor: 'white', padding: '16px' }}>
          <Form onSubmit={setMapCenter}>
            <div>
              Latitude <input type="number" name="lat" min="-90" max="90" step="0.000001" defaultValue={getCenter[0]} />
            </div>
            <div>
              Longitute <input type="number" name="lng" min="-180" max="180" step="0.000001" defaultValue={getCenter[1]} />
            </div>
            <div>
              <button type="submit">Trova posizione</button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
