import mongodb from 'mongodb'
const { MongoClient, ObjectId } = mongodb

import { config } from 'dotenv'
config()

const { MONGODB_URI, MONGODB_DB } = process.env

if (!MONGODB_URI) {
    throw new Error(
        'Por favor, defina a variável de ambiente MONGODB_URI dentro do arquivo .env'
    )
}

if (!MONGODB_DB) {
    throw new Error(
        'Por favor, defina a variável de ambiente MONGODB_DB dentro do arquivo .env'
    )
}

let cached = global.mongo

if (!cached) {
    cached = global.mongo = { conn: null, promise: null }
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
            return {
                client,
                db: client.db(MONGODB_DB),
                ObjectId: ObjectId
            }
        }).catch((error) => {
            throw new Error(
                `Não foi possível conectar no MongoDB: ${error}`
            )
        }).finally(() => {
            console.log('Conectado ao MongoDB')
        })
    }
    cached.conn = await cached.promise
    return cached.conn
}

export { MONGODB_DB, MONGODB_URI }