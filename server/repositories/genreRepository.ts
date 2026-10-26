import { asc, count, eq } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { bookGenres, genres } from '#server/database/schema'

export const genreRepository = {
    async list(
        executor: Executor = getDatabase()
    ) {
        return executor
            .select()
            .from(genres)
            .orderBy(asc(genres.name))
    },

    async findById(
        id: number,
        executor: Executor = getDatabase()
    ) {
        const [genre] = await executor
            .select()
            .from(genres)
            .where(eq(genres.id, id))
            .limit(1)
        return genre ?? null
    },

    async countBooks(
        id: number,
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [row] = await executor
            .select({ total: count() })
            .from(bookGenres)
            .where(eq(bookGenres.genreId, id))
        return row?.total ?? 0
    },

    async create(
        name: string,
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [created] = await executor
            .insert(genres)
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
            .update(genres)
            .set({ name })
            .where(eq(genres.id, id))
    },

    async delete(
        id: number,
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [result] = await executor
            .delete(genres)
            .where(eq(genres.id, id))
        return result.affectedRows > 0
    }
}