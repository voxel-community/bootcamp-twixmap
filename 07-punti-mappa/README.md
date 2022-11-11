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

Per *_caricare_* i dati in un route module di Remix, si usa un [**`loader`**](https://remix.run/docs/en/v1.3.2-pre.0/api/conventions#loader). Il **`loader`** è una funzione `async` che esportiamo e che restituisce una risposta a cui accediamo da dentor il nostro **`HTML`** tramite l'hook [`useLoaderData`](https://remix.run/docs/en/v1.3.2-pre.0/api/remix#useloaderdata).

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

💿 Aggiorna il file `app/routes/index.tsx` in modo da caricare tutti i punti dal nostro database.

<details>

<summary>app/routes/twixes.tsx</summary>

```tsx filename=app/routes/twixes.tsx lines=[1-2,4,11-13,15-20,23,47-51]
import type { LinksFunction, LoaderFunction } from "remix";
import { Link, Outlet, useLoaderData } from "remix";

import { db } from "~/utils/db.server";

type LoaderData = {
  twixListItems: Array<{ id: string; title: string }>;
};

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    twixListItems: await db.twix.findMany(),
  };
  return data;
};

export default function TwixesRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="twixes-layout">
      <header className="twixes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix twixes"
              aria-label="Remix twixes"
            >
              <span className="logo">💬</span>
              <span className="logo-medium">Twixes</span>
            </Link>
          </h1>
        </div>
      </header>
      <main className="twixes-main">
        <div className="container">
          <div className="twixes-list">
            <Link to=".">Get a random twix</Link>
            <p>Here are a few more twixes to check out:</p>
            <ul>
              {data.twixListItems.map((twix) => (
                <li key={twix.id}>
                  <Link to={twix.id}>{twix.title}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="twixes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
```

</details>

Ora dovresti vedere questo:

![List of twixes](../assets/04/twixes.png)
