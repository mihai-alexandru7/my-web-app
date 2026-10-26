import { and, desc, eq } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { userLibrary, books, publisherProfiles, reviews } from '#server/database/schema'

export type UpdateUserLibraryData = {
    lastPosition?: string
    lastReadAt?: Date
}

export const libraryRepository = {
    async findById(userId: number, bookId: number, executor: Executor = getDatabase()) {
        const [row] = await executor
            .select()
            .from(userLibrary)
            .where(and(eq(userLibrary.userId, userId), eq(userLibrary.bookId, bookId)))
            .limit(1)
        return row ?? null
    },

    async hasPurchased(userId: number, bookId: number, executor: Executor = getDatabase()): Promise<boolean> {
        const entry = await this.findById(userId, bookId, executor)
        return Boolean(entry)
    },

    async list(userId: number, executor: Executor = getDatabase()) {
        return executor
            .select({
                bookId: books.id,
                title: books.title,
                coverPath: books.coverPath,
                publisherName: publisherProfiles.publisherName,
                acquiredAt: userLibrary.acquiredAt,
                lastPosition: userLibrary.lastPosition,
                lastReadAt: userLibrary.lastReadAt,
                rating: reviews.rating,
                comment: reviews.comment
            })
            .from(userLibrary)
            .innerJoin(books, eq(books.id, userLibrary.bookId))
            .innerJoin(publisherProfiles, eq(publisherProfiles.userId, books.publisherId))
            .leftJoin(reviews, and(eq(reviews.userId, userId), eq(reviews.bookId, books.id)))
            .where(eq(userLibrary.userId, userId))
            .orderBy(desc(userLibrary.lastReadAt), desc(userLibrary.acquiredAt))
    },

    async create(
        data: { userId: number; bookId: number; orderItemId?: number | null },
        executor: Executor = getDatabase()
    ): Promise<void> {
        await executor
            .insert(userLibrary)
            .values({
                userId: data.userId,
                bookId: data.bookId,
                orderItemId: data.orderItemId ?? null
            })
    },

    async update(
        userId: number,
        bookId: number,
        data: UpdateUserLibraryData,
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [res] = await executor
            .update(userLibrary)
            .set({
                lastPosition: data.lastPosition,
                lastReadAt: data.lastReadAt ?? (data.lastPosition ? new Date() : undefined)
            })
            .where(and(eq(userLibrary.userId, userId), eq(userLibrary.bookId, bookId)))
        return res.affectedRows > 0
    },

    async delete(userId: number, bookId: number, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .delete(userLibrary)
            .where(and(eq(userLibrary.userId, userId), eq(userLibrary.bookId, bookId)))
        return res.affectedRows > 0
    }
}