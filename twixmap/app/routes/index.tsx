import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { latLng } from "leaflet";
import { useEffect, useState } from "react";

import { ClientOnly } from "remix-utils";
import { Map } from "~/components/map.client";
import { client } from "~/utils/db.server";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.9.2/dist/leaflet.css",
  },
];

type Point = {
  name: string,
  lat: number,
  lng: number,
  hash: string
}

type LoaderData = {
  points: Point[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const lat = url.searchParams.get("lat") || "";
  const lng = url.searchParams.get("lng") || "";

  const pointsCollection = client.db().collection("points")
  const points: Point[] = [];
  await pointsCollection.find().limit(10).forEach(doc => {
    points.push({
      name: doc.name,
      lat: doc.lat,
      lng: doc.lng,
      hash: doc.hash
    })
  })
  const data: LoaderData = {
    points: points
  };
  return data;
};

export default function Index() {
  const { points } = useLoaderData<LoaderData>()
  const submit = useSubmit()
  const markersPoints = points.map(p => {
    return {
      name: p.name,
      position: [p.lat, p.lng] as [number, number]
    }
  })

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

  function showNearbyPlaces () {
    submit(
      { lat: getCenter[0].toString(), lng: getCenter[1].toString() },
      {
        method: "get",
        action: `/`,
      }
    );
  }

  function showAllPlaces () {
    submit({}, { replace: true });
  }

  return (
    <div>
      <ClientOnly>
        {() => <Map center={getCenter} height="98vh" points={markersPoints} />}
      </ClientOnly>
      <div style={{ position: 'absolute', top: '0', right: '0', padding: '16px', zIndex: '1000' }}>
        <div style={{ backgroundColor: 'white', padding: '16px' }}>
          <Form onSubmit={setCenterFromForm}>
            <div>
              Latitude <input type="number" name="lat" min="-90" max="90" step="0.0000001" defaultValue={getCenter[0]} />
            </div>
            <div>
              Longitude <input type="number" name="lng" min="-180" max="180" step="0.0000001" defaultValue={getCenter[1]} />
            </div>
            <div>
              <button type="submit">Trova posizione</button>
            </div>
          </Form>
          <div>
            <button onClick={() => setCenterFromGeo()}>La mia posizione</button>
          </div>
          <div>
            <button onClick={() => showAllPlaces()}>Tutti i posti</button>
          </div>
          <div>
            <button onClick={() => showNearbyPlaces()}>Posti vicini</button>
          </div>
        </div>
      </div>
    </div>
  );
}
