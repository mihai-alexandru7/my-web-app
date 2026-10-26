import { and, count, desc, eq } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { books, reviews, users } from '#server/database/schema'

export type ReviewFilter = { bookId?: number; userId?: number }

export type UpdateReviewData = {
    rating?: number | null
    comment?: string | null
}

function whereClause(filter: ReviewFilter) {
    return and(
        filter.bookId ? eq(reviews.bookId, filter.bookId) : undefined,
        filter.userId ? eq(reviews.userId, filter.userId) : undefined
    )
}

export const reviewRepository = {
    async findById(id: number, executor: Executor = getDatabase()) {
        const [row] = await executor
            .select()
            .from(reviews)
            .where(eq(reviews.id, id))
            .limit(1)
        return row ?? null
    },

    async findByUserAndBook(userId: number, bookId: number, executor: Executor = getDatabase()) {
        const [row] = await executor
            .select()
            .from(reviews)
            .where(and(eq(reviews.userId, userId), eq(reviews.bookId, bookId)))
            .limit(1)
        return row ?? null
    },

    async list(
        filter: ReviewFilter,
        options: { limit: number; offset: number },
        executor: Executor = getDatabase()
    ) {
        return executor
            .select({
                id: reviews.id,
                rating: reviews.rating,
                comment: reviews.comment,
                createdAt: reviews.createdAt,
                updatedAt: reviews.updatedAt,
                userId: reviews.userId,
                userFirstName: users.firstName,
                userLastName: users.lastName,
                bookId: reviews.bookId,
                bookTitle: books.title
            })
            .from(reviews)
            .innerJoin(users, eq(users.id, reviews.userId))
            .innerJoin(books, eq(books.id, reviews.bookId))
            .where(whereClause(filter))
            .orderBy(desc(reviews.createdAt))
            .limit(options.limit)
            .offset(options.offset)
    },

    async count(filter: ReviewFilter, executor: Executor = getDatabase()): Promise<number> {
        const [row] = await executor
            .select({ total: count() })
            .from(reviews)
            .where(whereClause(filter))
        return row?.total ?? 0
    },

    async create(
        data: { userId: number; bookId: number; rating?: number | null; comment?: string | null },
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [res] = await executor
            .insert(reviews)
            .values(data)
            .$returningId()
        return res.id
    },

    async update(id: number, data: UpdateReviewData, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .update(reviews)
            .set({
                rating: data.rating,
                comment: data.comment,
                updatedAt: new Date()
            })
            .where(eq(reviews.id, id))
        return res.affectedRows > 0
    },

    async upsert(
        data: { userId: number; bookId: number; rating?: number | null; comment?: string | null },
        executor: Executor = getDatabase()
    ): Promise<void> {
        const updateSet: Record<string, any> = {
            updatedAt: new Date()
        }
        if (data.rating !== undefined) updateSet.rating = data.rating
        if (data.comment !== undefined) updateSet.comment = data.comment

        await executor
            .insert(reviews)
            .values(data)
            .onDuplicateKeyUpdate({
                set: updateSet
            })
    },

    async delete(id: number, executor: Executor = getDatabase()): Promise<boolean> {
        const [result] = await executor
            .delete(reviews)
            .where(eq(reviews.id, id))
        return result.affectedRows > 0
    }
}