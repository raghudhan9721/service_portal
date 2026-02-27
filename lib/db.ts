import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongo(): Promise<Db> {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL!);
    await client.connect();
    db = client.db(process.env.DB_NAME);
  }
  return db!;
}

export async function getCollection(collectionName: string) {
  const database = await connectToMongo();
  return database.collection(collectionName);
}
