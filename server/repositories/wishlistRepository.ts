import { and, desc, eq, inArray } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { wishlistItems, books, publisherProfiles } from '#server/database/schema'

export const wishlistRepository = {
    async list(userId: number, executor: Executor = getDatabase()) {
        return executor
            .select({
                bookId: books.id,
                title: books.title,
                price: books.price,
                coverPath: books.coverPath,
                status: books.status,
                publisherName: publisherProfiles.publisherName,
                addedAt: wishlistItems.addedAt
            })
            .from(wishlistItems)
            .innerJoin(books, eq(books.id, wishlistItems.bookId))
            .innerJoin(publisherProfiles, eq(publisherProfiles.userId, books.publisherId))
            .where(eq(wishlistItems.userId, userId))
            .orderBy(desc(wishlistItems.addedAt))
    },

    async exists(userId: number, bookId: number, executor: Executor = getDatabase()): Promise<boolean> {
        const [row] = await executor
            .select({ id: wishlistItems.bookId })
            .from(wishlistItems)
            .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.bookId, bookId)))
            .limit(1)
        return Boolean(row)
    },

    async create(userId: number, bookId: number, executor: Executor = getDatabase()): Promise<void> {
        await executor
            .insert(wishlistItems)
            .values({ userId, bookId })
            .onDuplicateKeyUpdate({ set: { addedAt: new Date() } })
    },

    async update(userId: number, bookId: number, data: { addedAt: Date }, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .update(wishlistItems)
            .set({ addedAt: data.addedAt })
            .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.bookId, bookId)))
        return res.affectedRows > 0
    },

    async delete(userId: number, bookId: number, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .delete(wishlistItems)
            .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.bookId, bookId)))
        return res.affectedRows > 0
    },

    async deleteMany(userId: number, bookIds: number[], executor: Executor = getDatabase()): Promise<void> {
        if (!bookIds.length) return
        await executor
            .delete(wishlistItems)
            .where(and(eq(wishlistItems.userId, userId), inArray(wishlistItems.bookId, bookIds)))
    }
}