import { asc, eq } from 'drizzle-orm'
import { getDb } from '../utils/db'
import type { Executor } from '../utils/db'
import { languages } from '../database/schema'

export const languageRepository = {
    async list(executor: Executor = getDb()) {
        return executor.select().from(languages).orderBy(asc(languages.name))
    },

    async findById(id: number, executor: Executor = getDb()) {
        const [language] = await executor.select().from(languages).where(eq(languages.id, id)).limit(1)
        return language ?? null
    },

    async create(data: { code: string; name: string }, executor: Executor = getDb()): Promise<number> {
        const [created] = await executor.insert(languages).values(data).$returningId()
        return created.id
    },

    async update(id: number, data: { code?: string; name?: string }, executor: Executor = getDb()): Promise<void> {
        await executor.update(languages).set(data).where(eq(languages.id, id))
    },

    async delete(id: number, executor: Executor = getDb()): Promise<boolean> {
        const [result] = await executor.delete(languages).where(eq(languages.id, id))
        return result.affectedRows > 0
    },
}
