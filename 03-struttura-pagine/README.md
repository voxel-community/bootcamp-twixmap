# Routes

| Capitolo precedente  | Capitolo successivo     |
| :--------------- | ---------------: |
| [◀︎ 02-esplora-struttura-progetto](../02-esplora-struttura-progetto)| [04-aggiungi-mappa ▶︎](../04-aggiungi-mappa) |


Un sito web è formato da pagine. La prima cosa da fare, dunque, è preparare la struttura delle pagine. Questa app ha una struttura non complessa, abbiamo bisogno solo di poche cose:

* `/` per la nostra pagina principale che contiene la mappa GPS per visualizzare i nostri punti di interesse online

Si possono creare le pagine tramite [`remix.config.js`](https://remix.run/docs/en/v1.3.2-pre.0/api/conventions#remixconfigjs), ma il modo più comune e semplice per creare la nostra struttura delle pagine è attraverso il file system, ovvero usando una struttura di cartelle e file. **Questo sistema è chiamato "`file-based routing`"**.

Ogni file che creiamo nella cartella `app/routes` viene chiamato ["Route Module"](https://remix.run/docs/en/v1.3.2-pre.0/api/conventions#route-module-api) e seguendo una [convenzione nel rinominare i file](https://remix.run/docs/en/v1.3.2-pre.0/api/conventions#file-name-conventions), possiamo creare gli URL e i link che rispettano la struttura che vogliamo creare. 

Le pagine del sito web vanno collegate tra loro per funzionare - Remix si basa su [React Router](https://reactrouter.com/) per gestire il sistema di collegamento tra le varie pagine dell'applicazione, rendendo il processo rapido e automatico.

## Pagina iniziale

💿 Iniziamo creando la pagina iniziale, quella raggiungibile tramite (`/`). Per farlo, crea un file `index.tsx` dentro la cartella `app/routes` con dentro una funzione `export default` che esporta una funzione contenente la nostra pagina in formato `HTML`. Per adesso puoi far visualizzare quello che desideri, noi nell'esempio abbiamo voluto visualizzare **"Hello Index Route"**.

Clicca sulla freccia per vedere il codice

<details>

<summary>app/routes/index.tsx</summary>

```tsx filename=app/routes/index.tsx
export default function IndexRoute() {
  return <div>Hello Index Route</div>;
}
```

</details>

React Router supporta il **`nested routing`**, che significa che possiamo avere pagine e sottopagine nei nostri link. Ad esempio `app/routes/index.tsx` è una sottopagina di `app/root.tsx`. Nel nested routing, le pagine "genitore" sono responsabili della gestione e visualizzazione delle proprie pagine "figlie" o sottopagine.

💿 Aggiorna `app/root.tsx` per posizionare la sottopagina. Puoi farlo utilizzando il componente `<Outlet />` che ti viene fornito da `remix`. Quando metti un `<Outlet />`, stai dicendo alla pagina di visualizzare in quello spazio tutte le sue sotto-pagine

<details>

<summary>app/root.tsx</summary>

```tsx filename=app/root.tsx lines=[1,11]
import { LiveReload, Outlet } from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Twixmap</title>
      </head>
      <body>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  );
}
```

</details>

💿 Avviamo il server di sviluppo con il comando `npm run dev`. Questo comando permetterà all'applicazione di "ascoltare" i cambiamenti ai file, ricostruire il sito e grazie al componente `<LiveReload />`, permettere al tuo browser di ricaricarsi e visualizzare le pagine aggiornate.

💿 Apri il sito e dovresti visualizzare il messaggio che hai inserito:

![Index](/assets/hello-world.png)

Fantastico! Abbiamo appena creato tutte le principali pagine dell'applicazione.

| Capitolo precedente  | Capitolo successivo     |
| :--------------- | ---------------: |
| [◀︎ 02-esplora-struttura](../02-esplora-struttura)| [04-aggiungi-mappa ▶︎](../04-aggiungi-mappa) |