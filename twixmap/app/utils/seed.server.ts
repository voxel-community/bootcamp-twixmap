import { client } from './db.server'
import pointsSeed from './pointsSeed.json';
import { hash } from 'geokit';

const db = client.db()
const collection = db.collection("points")

const pointsWithGeohash = pointsSeed.map(point => {
    return {
        name: point.name,
        lat: point.lat,
        lng: point.lng,
        hash: hash({ lat: point.lat, lng: point.lng })
    }
});

collection.insertMany(pointsWithGeohash)

console.log('Tutti i punti sono stati caricati nel database')