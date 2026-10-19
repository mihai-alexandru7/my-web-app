import { asc, eq } from 'drizzle-orm'
import { getDb } from '../utils/db'
import type { Executor } from '../utils/db'
import { genres } from '../database/schema'

export const genreRepository = {
    async list(executor: Executor = getDb()) {
        return executor.select().from(genres).orderBy(asc(genres.name))
    },

    async create(name: string, executor: Executor = getDb()): Promise<number> {
        const [created] = await executor.insert(genres).values({ name }).$returningId()
        return created.id
    },

    async delete(id: number, executor: Executor = getDb()): Promise<boolean> {
        const [result] = await executor.delete(genres).where(eq(genres.id, id))
        return result.affectedRows > 0
    },
}
