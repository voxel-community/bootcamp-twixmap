# Aggiungi nuovi punti alla mappa

Ora che abbiamo preparato il database iniziamo ad aggiungere i punti sulla mappa. Inizialmente aggiungiamo dei punti sulla mappa con dei dati di prova, per poi collegare effettivamente tutto al nostro database.

## Aggiorniamo la mappa

Aggiungiamo alla mappa nuovi marker e un nuovo parametro chiamato `points`. Copia il seguente codice nel file `map.client.tsx`.

```tsx filename=app/components/map.client.tsx
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
```

Il nuovo parametro `points` è definito come `{ name: string, position: [number, number] }[]` cioè una lista di oggetti che contengono un nome e una posizione, dove la posizione è una lista di due numeri.

Questo nuovo parametro viene utilizzato nella nuova funzione `MultipleMarkers` per generare la lista dei nuovi marcatori. Se guardi attentamente viene utilizzata ancora la funzione di trasformazione `map`: in questo caso converte i punti arrivati dal loader in oggetti HTML (più specificatamente React).

Ora torniamo nel file `app/routes/index.tsx` e sostituisci queste righe.

```
<ClientOnly>
  {() => <Map center={getCenter} height="98vh" points={[{name:"BUC", position:[46.0599146, 11.1149482]}]} />}
</ClientOnly>
```

Dovrebbe essere apparso un nuovo punto con un etichetta della biblioteca universitaria centrale di Trento. Se la vedi significa che la mappa funziona e che possiamo collegare ora i dati reali nel database.

I mentor conoscono questi codici per aggiungere nuovi marcatori perchè hanno cercato online "how to add multiple markers to react leaflet map". Prova a fare una ricerca anche tu e vedi se trovi lo stesso codice o se trovi soluzioni alternative (sono tantissime!).

## Leggi dal database in un loader di Remix

Il nostro obiettivo è visualizzare alcuni punti sulla mappa dal database, all'inizio non saranno visualizzati i più vicini ma verranno presi i primi 10 presenti nel database. Non va bene caricare tutti i dati dal database, immagina di avere milioni di punti: causerebbe un improvviso sovraccarico del sistema e moltissimi dati scaricati (addirittura il browser potrebbe bloccarsi).

Per *_caricare_* i dati in un route module di Remix, si usa un [**`loader`**](https://remix.run/docs/en/v1.3.2-pre.0/api/conventions#loader). Il **`loader`** è una funzione `async` che esportiamo e che restituisce una risposta a cui accediamo da dentro il nostro **`HTML`** tramite l'hook [`useLoaderData`](https://remix.run/docs/en/v1.3.2-pre.0/api/remix#useloaderdata).

In sintesi quindi il `loader` è il codice che viene caricato quando l'utente entra su un sito o preme il tasto di aggiornamento della pagina. Solitamente si collega a un database, legge dei dati e li comunica alla struttura della pagina web. La pagina web utilizza `useLoaderData` per ottenere questi dati e aggiornarsi automaticamente.

Le funzioni `async` sono tutte quelle funzioni per cui non possiamo sapere quando finiranno a priori perchè dipendono da agenti esterni, quindi tipicamente vedrai diciture come `async` e `await` in funzioni che si collegano a database, leggono dati sul disco, scaricano dati da internet, e in generale fanno calcoli lenti. Sono parole speciali per evitare che il sistema si blocchi attendendo le risposte di funzioni generalmente lente.

Ecco un rapido esempio che legge da un database ipotetico tutti gli utenti presenti nel sistema (nella funzione `loader`) e ne visualizza una lista su schermo (nella funzione `Users`):

```tsx nocopy
// questo è un esempio. Non serve copiarlo 😄
import type { LoaderFunction } from "remix";
import { client } from "~/utils/db.server";

type LoaderData = { 
  users: Array<User> 
};

export let loader: LoaderFunction = async () => {
  const data: LoaderData = {
    users: await client.db.users.findMany(),
  };
  return data;
};

export default function Users() {
  const data = useLoaderData<LoaderData>();
  return (
    <ul>
      {data.users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Remix e il file `tsconfig.json` che vengono creati in automatico vengono configurati in modo da permettere di importare tutti i file della cartella `app/` utilizzando la shortcut `~` (lo puoi vedere sopra per l'import delle utils). Questo ti permette di non dover importare i file scrivendo l'intero percorso `../../`.

Il loader che servirà a noi è il seguente. Prenditi del tempo per capire dove posizionare il codice, più in basso c'è la soluzione completa per aiutarti.

```tsx
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { client } from "~/utils/db.server";

// qui c'è altro codice.

type Point = {
  name: string,
  lat: number,
  lng: number,
  hash: string
}

type LoaderData = {
  points: Point[];
};

export const loader: LoaderFunction = async () => {
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
    points: points,
  };
  return data;
};


// qui c'è la funzione Index()
```

Le definizioni di `Point` e `LoaderData` servono a TypeScript per capire in anticipo che formato avranno i dati del database in arrivo. Se avessimo utilizzato JavaScript non sarebbero stati necessari, ma il codice sarebbe diventato meno sicuro e più soggetto a bug (perchè il nostro editor non riesce a trovare errori in anticipo).

La funzione `loader` ora fa alcuni passaggi. Nella prima riga si collega al database in modo esattamente uguale al nostro file `seed.server.ts` quando abbiamo caricato inizialmente i punti. L'operazione `find()` permette di trovare tutti i dati nel database che rispettano una certa regola o filtro, in questo caso vogliamo tutto e quindi non abbiamo definito nessun filtro. L'operazione `limit(10)` serve per indicare che vogliamo solo i primi 10 risultati. Infine la funzione `forEach()` permette di scansionare un documento del database alla volta e di fare varie operazioni, in questo caso aggiungiamo al vettore `points` ogni punto che troviamo.

Nella funzione `Index()` invece aggiungi il seguente codice per collegare alla grafica i dati che arrivano dal server. Anche qui prova a individuare i punti corretti dove inserire questo codice, non è un esercizio semplice e avrai comunque in basso la soluzione completa.

```tsx
import { Form, useLoaderData } from "@remix-run/react";

// qui c'è altro codice.

export default function Index() {
  const { points } = useLoaderData<LoaderData>()
  const markersPoints = points.map(p => {
    return {
      name: p.name,
      position: [p.lat, p.lng] as [number, number]
    }
  })

  const [getCenter, setCenter] = useState<[number, number]>([0, 0])

// qui c'è altro codice.

      <ClientOnly>
        {() => <Map center={getCenter} height="98vh" points={markersPoints} />}
      </ClientOnly>

// qui c'è altro codice.
```

La funzione `useLoaderData()` è proprio quella che permette di collegare i dati del database al nostro componente React e quindi alla grafica. Purtroppo la struttura del database non va bene per la nostra mappa e quindi dobbiamo trasformare gli oggetti. Ogni volta che dobbiamo trasformare oggetti utilizziamo la funzione `map()`. Togliamo infine i dati fissi che avevamo messo in precedenza alla mappa e colleghiamo i `markersPoints`.

💿 Ecco la soluzione completa per il file il file `app/routes/index.tsx` in modo da caricare tutti i punti dal nostro database.

<details>

<summary>app/routes/index.tsx</summary>

```tsx filename=app/routes/index.tsx
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
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

export const loader: LoaderFunction = async () => {
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
    points: points,
  };
  return data;
};

export default function Index() {
  const { points } = useLoaderData<LoaderData>()
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
        </div>
      </div>
    </div>
  );
}
```
</details>