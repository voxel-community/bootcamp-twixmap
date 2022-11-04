# Rileva la posizione GPS

| Capitolo precedente  |
| :--------------- |
| [◀︎ 04-aggiungi-mappa](../04-aggiungi-mappa)|

## Cosa sono le WebAPI

Siamo sempre state abituate ad avere le applicazioni sui nostri dispositivi Android e iOS con le più svariate funzioni: il GPS per utilizzare il navigatore, l'NFC per pagamenti rapidi e sicuri senza portarsi dietro il portafoglio, il bluetooth per condividere file e ascoltare musica sia con altri che con dispositivi (tipo le casse bluetooth), per non parlare infine delle funzioni di registrazione video e audio.

Solo di recente sono state messe a disposizione anche sui browser tutte queste funzioni attraverso le WebAPI, dei comandi specifici che possono essere usati sui browser per attivare le funzioni che abbiamo visto senza essere delle app native.

Nell'industria software il termine WebAPI è usato in due contesti: 
- per identificare le **WebAPI** ufficiali dei browser, tutte le funzioni descritte poco fa usate per potenziare l'utilizzo del proprio browser,
- in senso generico, per descrivere una qualunque funzione di un server per accedere a dati e informazioni utilizzando protocolli tipici di Internet tipo HTTPS (**web API**)

Ad esempio, la tua app preferita di delivery probabilmente utilizza le **WebAPI** del browser per identificare la tua posizione GPS (sviluppate dai team di Chrome, Edge, Firefox) e poi delle **web API** specifiche sviluppate dal team dell'app di delivery per creare il tuo ordine o farti visualizzare lo stato della consegna.

## Le WebAPI di geolocalizzazione

Aggiungiamo ora alla nostra app un bottone che permette di trovare immediatamente la posizione esatta dell'utente che utilizza il sistema.

Per farlo, ci vengono in aiuto le WebAPI di geolocalizzazione con cui possiamo chiedere al browser diverse informazioni, tra cui la latitudine e longitudine dell'utente. Ogni volta che verranno utilizzate queste WebAPI il browser richiederà all'utente l'autorizzazione per utilizzare la geolocalizzazione del computer.

### Rilevamento manuale della posizione

Nella funzione `Index()` del file `index.tsx` aggiungi la seguente funzione per andare a raccogliere i dati di longituidine e latitudine. Utilizzeremo la stessa funzione `setCenter()` per andare a comunicare queste informazioni alla mappa. 

```tsx
function setCenterFromGeo() {
   navigator.geolocation.getCurrentPosition((position) => {
   setCenter([position.coords.latitude, position.coords.longitude]);
   } , (error) => {
   // TODO error
   })
}
```

Ora è sufficiente aggiungere un bottone sotto al form che chiami effettivamente questa funzione:

```tsx
// qui finisce il Form
<div>
   <button onClick={() => setCenterFromGeo()}>La mia posizione</button>
</div>
```

Il file finale dovrebbe risultare con questo contenuto:

```tsx
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

```

### Rilevamento automatico della posizione

Solitamente quando apriamo applicazioni di mappe viene visualizzata e fissata la nostra posizione corrente. Quando utilizziamo le WebAPI del browser, dobbiamo avere la certezza assoluta che questo codice venga eseguito solo sul browser (`client`) e non sul server.

Infatti il server non conosce le WebAPI del browser ma tutto il codice che si vede nel file `index.tsx` viene eseguito almeno una volta nel server e potrebbe dare problemi. Per essere certi che la funzione GPS venga eseguita solo sul browser possiamo utilizzare la `useEffect()` - una sua caratteristica infatti è che viene invocata unicamente quando l'utente riesce effettivamente a vedere l'applicazione sullo schermo e dunque siamo sicuri che il codice stia venendo eseguito sul browser.

Per utilizzarla, imortala aggiornando l'import all'inizio del file:

```tsx
import { useEffect, useState } from "react";
```

Ora basta quindi inserire subito dopo la funzione `setCenterFromGeo()` il seguente codice:

```tsx
useEffect(() => {
   setCenterFromGeo();
}, [])
```

Adesso, al primo caricamento l'app passa dallo stato zero alla nostra posizione in automatico.

| Capitolo precedente  |
| :--------------- |
| [◀︎ 04-aggiungi-mappa](../04-aggiungi-mappa)|
