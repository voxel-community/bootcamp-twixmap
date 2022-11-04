# Aggiungi la mappa

| Capitolo precedente  | Capitolo successivo     |
| :--------------- | ---------------: |
| [◀︎ 03-struttura-pagine](../03-struttura-pagine)| [05-gps-automatico ▶︎](../05-gps-automatico) |

## OpenStreet Map

Una grande community globale ha raccolto tutti i dati necessari a ricostruire una intera mappa del globo senza doversi appoggiare a servizi a pagamento come Google Maps o Apple Maps. Di fatto, OpenStreet Map è il piu grande progetto open-source di mappatura terrestre.

Possiamo utilizzare gratuitamente questi dati per costruire la nostra mappa. Il progetto LeafLet è una libreria che permette di collegarsi ai server di OpneStreet Map e renderizzare delle mappe sul browser.

## Installa i pacchetti delle mappe

Per installare tutto quello di cui abbiamo bisogno utilizzeremo NPM, il repository ufficiale di tutti i pacchetti Javascript. Per installare i pacchetti richiesti, esegui sul terminale il comdando seguente: 

```
npm install leaflet react-leaflet remix-utils @types/leaflet
```

## Aggiustiamo Remix per le mappe

All'inizio del tutorial abbiamo modificato il file `root.tsx`. Normalmente, questo file non viene modificato molto e la sostituzione che abbiamo fatto era principalmente a scopo educativo. LeafLet avrà bisogno di un foglio di stile importato tramite un link e di alcuni script che verranno caricati in modo automatico, di conseguenza abbiamo bisogno di aggiungere a Remix la gestione dei link e e degli script.

Sostituisci il contenuto del file `root.tsx` con il seguente codice:

```tsx
import { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Outlet,
  Scripts,
} from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Twixmap</title>
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

## Aggiungi la mappa

Leaflet permette di costruire una grandissima quantità di mappe diverse tra loro, utilizzando dei componenti software come se fossero dei mattoncini Lego. Abbiamo preparato per te una mappa di base che carica i dati da OpenStreet Map e visualizza un marker al centro della schermata con la posizione da te scelta.

Crea una nuova cartella `app/components` e crea un file `map.client.tsx`.

Dentro il file `map.client.tsx` incolla il seguente codice: 

```tsx
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

export function Map({ center, height }: { center: [number, number], height: string }) {
  
  return (
    <div style={{ height }}>
      <MapContainer
        style={{
          height: "100%",
        }}
        center={center}
        zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} />
      </MapContainer>
    </div>
  );
}
```

Il file di questa mappa nel nome contene la parola `client`: su Remix specificatamente, ma in realtà anche su altre tecnologie, scrivere `client` in un file indica che quel file deve essere solo usato dal browser. Al contrario, la dicitura `server` indica che deve essere utilizzato solo dal server.

Questa è una cosa molto pratica perché ci assicura, ad esempio, che informazioni importanti, private o di sicurezza rimangano sul server e che invece componenti grafici che il server non è in grado di capire appaiono solo sul browser. I file `client` sono tipici ogni volta che vengono inserite mappe, grafici o componenti che vanno ad animare e renderizzare qualcosa in particolare.

Ora è il momento di aggiungere la mappa alla nostra pagina. Dentro il file `routes/index.tsx` inserisci questo codice:

```tsx
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

  return (
    <div>
      <ClientOnly>
        {() => <Map center={[latitudine, longitudine]} height="98vh" />}
      </ClientOnly>
    </div>
  );
}
```

Sostituisci latitudine e longitudine, che adesso non sono definite e dovrebbero dare un errore nell'editor, con una latitudine e una longitudine a tua scelta.

Come vedi, c'è un componente speciale chiamato `ClientOnly`. Questo oggetto va a costruire il suo contenuto solo nel momento in cui tutta la pagina ha finito di caricare. 

Utilizza il comando `npm run dev` per avviare l'app e vederla nel browser in tempo reale all'indirizzo: `http://localhost:3000`

Se rimuovi `ClientOnly` e lasci solo il tag della mappa dovresti vedere un errore che fa riferimento a ESM. ESM è una nuova tecnologia per gestire i pacchetti e siamo storicamente in un momento dove stiamo cercando di spostarci da un vecchio sistema. Maggiori dettagli a questo link: [https://remix.run/docs/en/v1/pages/gotchas#importing-esm-packages](https://remix.run/docs/en/v1/pages/gotchas#importing-esm-packages)

## Cambia la posizione e naviga la mappa

La nostra applicazione non può tenere dei valori fissi nel codice detti anche `hardcoded`, quindi aggiungiamo un piccolo form che permette di scrivere una qualunque longitudine e latitudine per poter spostare il punto sulla mappa.

Utilizzeremo due oggetti avanzati di React (il framework su cui è basato la tecnologia Remix che stiamo usando per creare l'app):

- `useState`, una funzione che permette di trasferire delle informazioni da una componente all'altro attraverso un concetto di "stato condiviso" - nel nostro caso, sono i valori di latitudine e longitudine: un utente scriverà i valori nel form, questi saranno salvati nello stato e questi poi verranno trasferiti alla mappa,
- `useEffect`, quando lo stato nuovo arriva alla mappa, ha bisogno di capire che queste nuove informazioni devono essere usate per aggiornare la posizione. Questa funzione viene usata per dire alla mappa cosa deve fare quando lo stato cambia. Possiamo pensarla come la funzione che descrive l'effetto o le conseguenze di un certo cambiamento.

### Aggiungiamo il form

Sostituisci il contenuto dentro il file `index.tsx` con il seguente codice:

```tsx

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
  const [getCenter, setCenter] = useState<[number, number]>([47.129856, 12.918273])
  
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
              Latitude <input type="number" name="lat" min="-90" max="90" step="0.0000001" defaultValue={getCenter[0]} />
            </div>
            <div>
              Longitude <input type="number" name="lng" min="-180" max="180" step="0.0000001" defaultValue={getCenter[1]} />
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
```

Il punto più importante risiede nelle prime righe della funzione `Index()`:
qui c'è la creazione dello stato condiviso che possiamo immaginare come una scatola dove alcuni componenti grafici ne modificano il contenuto con la funzione `setCenter` (ad esempio il form), e altri componenti ne utilizzano il contenuto con la funzione `getCenter` (ad esempio la mappa).

La funzione `setMapCenter()` viene chiamata dal `Form` al click del bottone `Trova posizione` e specifica allo stato condiviso quale è la longitudine e quale la latitudine, usando le informazioni inserite nei campi del form () e chiamando la funzione `setCenter`.

Se provi ora a modificare la posizione, vedrai che il marker è l'unica cosa che viene spostata e se la posizione è molto distante può finire fuori dalla mappa visualizzata.

La mappa non è ancora capace di cambiare la sua posizione quando riceve una nuova coordinata di centro.

### Finiamo la mappa

In questo caso, abbiamo bisogno di modificare un componente quando cambiano i suoi paramentri: nel caso della mappa, il parametro è `center`. In questi casi, si utilizza la funzione `useEffect()` per monitorare il loro cambiamento.

Dentro il file `map.client.tsx`, copia e incolla il seguente codice:

```tsx
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

```

Ora, quando cambi i dati di longitudine e latitudine, la mappa si aggiorna spostandosi sulla nuova posizione inserita.

| Capitolo precedente  | Capitolo successivo     |
| :--------------- | ---------------: |
| [◀︎ 03-struttura-pagine](../03-struttura-pagine)| [05-gps-automatico ▶︎](../05-gps-automatico) |











