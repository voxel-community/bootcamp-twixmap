import { MongoClient } from "mongodb";

const databaseUrl = process.env.DATABASE_URL || ""

let client: MongoClient;

declare global {
  var __db: MongoClient | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
    client = new MongoClient(databaseUrl);
    client.connect();
} else {
  if (!global.__db) {
    global.__db = new MongoClient(databaseUrl);
    global.__db.connect();
  }
  client = global.__db;
}

export { client };
