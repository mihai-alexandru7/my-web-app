import mysql from 'mysql2/promise'
import type { Pool } from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'

let pool: Pool | undefined

export function getPool(): Pool {
    if (!pool) {
        const { db } = useRuntimeConfig()
        pool = mysql.createPool({
            host: db.host,
            port: Number(db.port),
            user: db.user,
            password: db.password,
            database: db.database,
            charset: 'utf8mb4',
            waitForConnections: true,
            connectionLimit: 10,
        })
    }
    return pool
}

function createDatabase() {
    return drizzle({ client: getPool() })
}

let drizzleDatabase: ReturnType<typeof createDatabase> | undefined

export function getDatabase() {
    return (drizzleDatabase ??= createDatabase())
}

export type Database = ReturnType<typeof getDatabase>

export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]

export type Executor = Database | Transaction
