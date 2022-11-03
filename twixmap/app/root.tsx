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
