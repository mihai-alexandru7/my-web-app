import { and, desc, eq } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { cartItems, books, publisherProfiles } from '#server/database/schema'

export const cartRepository = {
    async list(userId: number, executor: Executor = getDatabase()) {
        return executor
            .select({
                bookId: books.id,
                title: books.title,
                price: books.price,
                coverPath: books.coverPath,
                status: books.status,
                publisherName: publisherProfiles.publisherName,
                addedAt: cartItems.addedAt
            })
            .from(cartItems)
            .innerJoin(books, eq(books.id, cartItems.bookId))
            .innerJoin(publisherProfiles, eq(publisherProfiles.userId, books.publisherId))
            .where(eq(cartItems.userId, userId))
            .orderBy(desc(cartItems.addedAt))
    },

    async listForCheckout(userId: number, executor: Executor = getDatabase()) {
        return executor
            .select({
                bookId: books.id,
                price: books.price,
                status: books.status
            })
            .from(cartItems)
            .innerJoin(books, eq(books.id, cartItems.bookId))
            .where(eq(cartItems.userId, userId))
            .for('update')
    },

    async exists(userId: number, bookId: number, executor: Executor = getDatabase()): Promise<boolean> {
        const [row] = await executor
            .select({ id: cartItems.bookId })
            .from(cartItems)
            .where(and(eq(cartItems.userId, userId), eq(cartItems.bookId, bookId)))
            .limit(1)
        return Boolean(row)
    },

    async create(userId: number, bookId: number, executor: Executor = getDatabase()): Promise<void> {
        await executor
            .insert(cartItems)
            .values({ userId, bookId })
            .onDuplicateKeyUpdate({ set: { addedAt: new Date() } })
    },

    async update(userId: number, bookId: number, data: { addedAt: Date }, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .update(cartItems)
            .set({ addedAt: data.addedAt })
            .where(and(eq(cartItems.userId, userId), eq(cartItems.bookId, bookId)))
        return res.affectedRows > 0
    },

    async delete(userId: number, bookId: number, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .delete(cartItems)
            .where(and(eq(cartItems.userId, userId), eq(cartItems.bookId, bookId)))
        return res.affectedRows > 0
    },

    async deleteAll(userId: number, executor: Executor = getDatabase()): Promise<void> {
        await executor
            .delete(cartItems)
            .where(eq(cartItems.userId, userId))
    }
}