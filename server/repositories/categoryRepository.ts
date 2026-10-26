import { asc, count, eq } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { bookCategories, categories } from '#server/database/schema'

export const categoryRepository = {
    async list(
        executor: Executor = getDatabase()
    ) {
        return executor
            .select()
            .from(categories)
            .orderBy(asc(categories.name))
    },

    async findById(
        id: number,
        executor: Executor = getDatabase()
    ) {
        const [category] = await executor
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1)
        return category ?? null
    },

    async countBooks(
        id: number,
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [row] = await executor
            .select({ total: count() })
            .from(bookCategories)
            .where(eq(bookCategories.categoryId, id))
        return row?.total ?? 0
    },

    async create(
        name: string,
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [created] = await executor
            .insert(categories)
            .values({ name })
            .$returningId()
        return created.id
    },

    async update(
        id: number,
        name: string,
        executor: Executor = getDatabase()
    ): Promise<void> {
        await executor
            .update(categories)
            .set({ name })
            .where(eq(categories.id, id))
    },

    async delete(
        id: number,
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [result] = await executor
            .delete(categories)
            .where(eq(categories.id, id))
        return result.affectedRows > 0
    }
}