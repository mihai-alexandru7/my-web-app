import { asc, eq } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { languages } from '#server/database/schema'

export const languageRepository = {
    async list(
        executor: Executor = getDatabase()
    ) {
        return executor
            .select()
            .from(languages)
            .orderBy(asc(languages.name))
    },

    async findById(
        id: number,
        executor: Executor = getDatabase()
    ) {
        const [language] = await executor
            .select()
            .from(languages)
            .where(eq(languages.id, id))
            .limit(1)
        return language ?? null
    },

    async create(
        data: { code: string; name: string },
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [created] = await executor
            .insert(languages)
            .values(data)
            .$returningId()
        return created.id
    },

    async update(
        id: number,
        data: { code?: string; name?: string },
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [result] = await executor
            .update(languages)
            .set(data)
            .where(eq(languages.id, id))
        return result.affectedRows > 0
    },

    async delete(
        id: number,
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [result] = await executor
            .delete(languages)
            .where(eq(languages.id, id))
        return result.affectedRows > 0
    }
}
