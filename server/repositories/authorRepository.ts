import { asc, eq } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { authors } from '#server/database/schema'

export const authorRepository = {
    async findById(id: number, executor: Executor = getDatabase()) {
        const [author] = await executor
            .select()
            .from(authors)
            .where(eq(authors.id, id))
            .limit(1)
        return author ?? null
    },

    async findByName(name: string, executor: Executor = getDatabase()): Promise<number | null> {
        const [row] = await executor
            .select({ id: authors.id })
            .from(authors)
            .where(eq(authors.name, name))
            .limit(1)
        return row?.id ?? null
    },

    async list(executor: Executor = getDatabase()) {
        return executor
            .select()
            .from(authors)
            .orderBy(asc(authors.name))
    },

    async create(name: string, executor: Executor = getDatabase()): Promise<number> {
        const [res] = await executor
            .insert(authors)
            .values({ name })
            .$returningId()
        return res.id
    },

    async update(id: number, name: string, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .update(authors)
            .set({ name })
            .where(eq(authors.id, id))
        return res.affectedRows > 0
    },

    async delete(id: number, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .delete(authors)
            .where(eq(authors.id, id))
        return res.affectedRows > 0
    }
}