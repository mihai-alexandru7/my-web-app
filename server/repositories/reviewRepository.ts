import { and, count, desc, eq } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { books, reviews, users } from '#server/database/schema'

export type ReviewFilter = { bookId?: number; userId?: number }

function whereClause(filter: ReviewFilter) {
    return and(
        filter.bookId ? eq(reviews.bookId, filter.bookId) : undefined,
        filter.userId ? eq(reviews.userId, filter.userId) : undefined
    )
}

export const reviewRepository = {
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

    async countByFilter(
        filter: ReviewFilter,
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [row] = await executor
            .select({ total: count() })
            .from(reviews)
            .where(whereClause(filter))
        return row?.total ?? 0
    },

    async delete(
        id: number,
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [result] = await executor
            .delete(reviews)
            .where(eq(reviews.id, id))
        return result.affectedRows > 0
    }
}
