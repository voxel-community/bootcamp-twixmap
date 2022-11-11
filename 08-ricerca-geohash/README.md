# Visualizza i luoghi più vicini alla tua posizione

Come hai potuto vedere nel video del capitolo precedente GeoHash separa tutto il globo in settori quadrati dove ogni settore è identificato con un hash specifico. Un hash è una stringa di testo composta da vari numeri e lettere e che viene utilizzato in diverse tecnologie, non solo quella geospaziale. 

GeoHash ha una caratteristica particolare che lo rende utile: la parte iniziale di ogni hash è uguale per tutti i settori che sono vicini fra loro. Più la parte iniziale è corta, più il raggruppamento è esteso sul pianeta e quindi grande, mentre più la parte iniziale è lunga il raggruppamento è piu specifico e quindi piccolo. La lunghezza di questa parte iniziale è chiamata precisione.

Ad esempio, con una precisione di `1`, riusciamo a raggruppare tutti gli hash di un intero continente, con una precisione di `4` magari potremmo raggruppare gli hash a livello di una regione. Nello script `app/utils/seed.server.ts`, quando abbiamo generato l'hash non abbiamo indicato nessuna precisione ma di default è pari a `10`. 

In informatica, e soprattutto nelle tecnologie database, la funzione che permette di leggere da un database tutti i dati che hanno una certa parte iniziale di un testo è molto utilizzata. Nei computer possiamo utilizzare l'operatore `>`, anche chiamato `greater than (gt)`, per chiedere tutte le stringhe di testo maggiori di una certa stringa data - se il maggiore viene usato sul testo, indica tutte le stringhe di testo successive rispetto all'ordine alfabetico. Per essere precise, i computer utilizzano l'ordine **lessicografico** (e non alfabetico) che differenzia anche l'ordine dei numeri e delle lettere maiuscole/minuscole.

## Creiamo il filtro geohash nel Loader

```tsx
///qui c'è altro codice
import { hash } from 'geokit';

/// qui c'è altro codice

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const latParam = url.searchParams.get("lat") || "";
  const lngParam = url.searchParams.get("lng") || "";

  let currentHash = ""

  if (latParam !== "" && lngParam !== "") {
    const lat = parseFloat(latParam)
    const lng = parseFloat(lngParam)
    const precision = 5
    currentHash = hash({ lat:lat, lng: lng }, precision)
  }

  const pointsCollection = client.db().collection("points")
  const points: Point[] = [];
  await pointsCollection.find({ hash: { $gte: currentHash } }).limit(10).forEach(doc => {
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

/// qua sotto c'è la Index()

```

Negli import abbiamo aggiunto la liberia `geokit` che abbiamo usato anche per generare il seed di dati. Abbiamo poi aggiunto all'inizio della funzione `loader` alcune righe per andare a scansionare latitudine e longitudine contenuti nell'url.

Infatti, se ora provate ad accedere alla vostra app con `http://localhost:3000` oppure con [http://localhost:3000/?lat=46.0695515&lng=11.1256332](http://localhost:3000/?lat=46.0695515&lng=11.1256332), nel primo caso vediamo come al solito tutti i punti presenti mentre nel secondo caso vedremo solo i punti qui a Trento.

Per andare a differenziare queste due situazioni usiamo il selettore `if`. I numeri vengono decodificati e vengono passati a GeoHash - questa volta però la precisione eè più bassa dunque l'hash generato sarà più corto.

In questo modo, nella funzione `find()` possiamo aggiungere il nostro filtro chiedendo al database di consegnarci tutti i punti che hanno un hash successivo in ordine lessicografico a quello della nostra posizione selezionata. In questo caso, l'operatore utilizzato è `>=`, anche chiamato `greater equal (ge)`. 

Puoi vedere lo stesso approccio anche direttamente su Google Maps, dove nell'url puoi sempre trovare la posizione attuale del centro della mappa nei parametri dell'url.

Puoi provare ad aggiungere altri punti sulla mappa ripetendo il passaggio [[[linkkk]]] e provando a sostituire nell'url differenti latitudini e longitudini. Noterai che a volte si presentano gli errori descritti nel video di spiegazione del capitolo precedente.

## Aggiungi dei bottoni per visualizzare rapidamente i luoghi vicini o tutti

Per visualizzare i luoghi vicini o tutti puoi sia usare un URL diretto, scrivendolo tu a mano la ricerca, oppure puoi farlo fare alla funzione che esegue la stessa operazione: crea l'URl con (o senza) i parametri, lo invia e ricarica la pagina con i nuovi dati da visualizzare.

Per farlo, dentro la funzione `Index()` nel file `app/routes/index.tsx`, inserisci questo codice:

```tsx
/// qui ci sono altri import
import { Form, useLoaderData, useSubmit } from "@remix-run/react"; // aggiorna questo import con la funzione useSumbit

/// qui c'è altro codice

export default function Index() {
  const submit = useSubmit()

/// qui c'è altro codice

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
    // qui c'è la mappa
  )

}
```

Poi aggiungi i due bottoni che chiamano queste funzioni sostituendo il contenuto dentro la funzione `return` con questo codice:

```tsx
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
```

Ora, ricarica la pagina e troverai due bottoni: `Tutti i posti` e `Posti vicini` - cliccando il primo, vedrai tutte le posizioni del database mentre cliccando il secondo vedrai solo le posizioni di Trento.

La funzione `submit()` infatti permette di inviare richieste al server di Remix per richiedere nuovi dati o effettuare delle operazioni. In questo caso, quando chiediamo le posizioni vicine con la funzione `showNearbyPlaces()` stiamo ricaricando la pagina della mappa (con la modalità `get`), aggiungendo due parametri: `lat` e `lng`. Nella funzione con cui visualizziamo tutti i posti `showAllPlaces()`, stiamo richiedendo la pagina senza quei parametri usando una funzione speciale `replace()`.