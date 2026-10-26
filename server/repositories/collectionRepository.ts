import { and, desc, eq, sql } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { collections, collectionBooks, books, publisherProfiles } from '#server/database/schema'

export type UpdateCollectionData = {
    name?: string
    bookIds?: number[]
}

export const collectionRepository = {
    async findById(userId: number, id: number, executor: Executor = getDatabase()) {
        const [row] = await executor
            .select()
            .from(collections)
            .where(and(eq(collections.id, id), eq(collections.userId, userId)))
            .limit(1)
        return row ?? null
    },

    async list(userId: number, executor: Executor = getDatabase()) {
        const rows = await executor
            .select({
                id: collections.id,
                name: collections.name,
                createdAt: collections.createdAt,
                booksCount: sql<number>`cast(count(${collectionBooks.bookId}) as unsigned)`
            })
            .from(collections)
            .leftJoin(collectionBooks, and(eq(collectionBooks.collectionId, collections.id), eq(collectionBooks.userId, userId)))
            .where(eq(collections.userId, userId))
            .groupBy(collections.id, collections.name, collections.createdAt)
            .orderBy(desc(collections.createdAt))

        return rows.map(r => ({
            ...r,
            booksCount: Number(r.booksCount)
        }))
    },

    async listBooks(userId: number, collectionId: number, executor: Executor = getDatabase()) {
        return executor
            .select({
                bookId: books.id,
                title: books.title,
                coverPath: books.coverPath,
                publisherName: publisherProfiles.publisherName,
                addedAt: collectionBooks.addedAt
            })
            .from(collectionBooks)
            .innerJoin(books, eq(books.id, collectionBooks.bookId))
            .innerJoin(publisherProfiles, eq(publisherProfiles.userId, books.publisherId))
            .where(and(eq(collectionBooks.collectionId, collectionId), eq(collectionBooks.userId, userId)))
            .orderBy(desc(collectionBooks.addedAt))
    },

    async create(
        userId: number,
        data: { name: string; bookIds?: number[] },
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [created] = await executor
            .insert(collections)
            .values({ userId, name: data.name })
            .$returningId()

        if (data.bookIds && data.bookIds.length > 0) {
            const uniqueBookIds = [...new Set(data.bookIds)]
            const values = uniqueBookIds.map((bookId) => ({
                collectionId: created.id,
                userId,
                bookId
            }))
            await executor.insert(collectionBooks).values(values)
        }

        return created.id
    },

    async update(
        userId: number,
        id: number,
        data: UpdateCollectionData,
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        let updated = false

        if (data.name !== undefined) {
            const [res] = await executor
                .update(collections)
                .set({ name: data.name })
                .where(and(eq(collections.id, id), eq(collections.userId, userId)))
            updated = res.affectedRows > 0
        }

        if (data.bookIds !== undefined) {
            await executor
                .delete(collectionBooks)
                .where(and(eq(collectionBooks.collectionId, id), eq(collectionBooks.userId, userId)))

            if (data.bookIds.length > 0) {
                const uniqueBookIds = [...new Set(data.bookIds)]
                const values = uniqueBookIds.map((bookId) => ({
                    collectionId: id,
                    userId,
                    bookId
                }))
                await executor.insert(collectionBooks).values(values)
            }
            updated = true
        }

        return updated
    },

    async addBook(userId: number, collectionId: number, bookId: number, executor: Executor = getDatabase()): Promise<void> {
        await executor
            .insert(collectionBooks)
            .values({ userId, collectionId, bookId })
            .onDuplicateKeyUpdate({ set: { addedAt: new Date() } })
    },

    async removeBook(userId: number, collectionId: number, bookId: number, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .delete(collectionBooks)
            .where(and(
                eq(collectionBooks.userId, userId),
                eq(collectionBooks.collectionId, collectionId),
                eq(collectionBooks.bookId, bookId)
            ))
        return res.affectedRows > 0
    },

    async delete(userId: number, id: number, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .delete(collections)
            .where(and(eq(collections.id, id), eq(collections.userId, userId)))
        return res.affectedRows > 0
    }
}