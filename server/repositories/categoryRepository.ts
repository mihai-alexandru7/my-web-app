import { asc, eq } from 'drizzle-orm'
import { getDb } from '../utils/db'
import type { Executor } from '../utils/db'
import { categories } from '../database/schema'

export const categoryRepository = {
    async list(executor: Executor = getDb()) {
        return executor.select().from(categories).orderBy(asc(categories.name))
    },

    async create(name: string, executor: Executor = getDb()): Promise<number> {
        const [created] = await executor.insert(categories).values({ name }).$returningId()
        return created.id
    },

    async delete(id: number, executor: Executor = getDb()): Promise<boolean> {
        const [result] = await executor.delete(categories).where(eq(categories.id, id))
        return result.affectedRows > 0
    },
}
