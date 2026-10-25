import { and, asc, count, desc, eq } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import {
    authors,
    bookAuthors,
    bookCategories,
    cartItems,
    bookGenres,
    books,
    categories,
    genres,
    languages,
    publisherProfiles
} from '#server/database/schema'

export type BookStatus = typeof books.$inferSelect['status']

export const bookRepository = {
    async listByStatus(
        status: BookStatus,
        options: { limit: number; offset: number },
        executor: Executor = getDatabase()
    ) {
        return executor
            .select({
                id: books.id,
                title: books.title,
                price: books.price,
                status: books.status,
                createdAt: books.createdAt,
                publisherId: books.publisherId,
                publisherName: publisherProfiles.publisherName
            })
            .from(books)
            .innerJoin(publisherProfiles, eq(publisherProfiles.userId, books.publisherId))
            .where(eq(books.status, status))
            .orderBy(status === 'pending' ? asc(books.createdAt) : desc(books.createdAt))
            .limit(options.limit)
            .offset(options.offset)
    },

    async countByStatus(
        status: BookStatus,
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [row] = await executor
            .select({ total: count() })
            .from(books)
            .where(eq(books.status, status))
        return row?.total ?? 0
    },

    async findStatus(
        id: number,
        executor: Executor = getDatabase()
    ): Promise<BookStatus | null> {
        const [row] = await executor
            .select({ status: books.status })
            .from(books)
            .where(eq(books.id, id))
            .limit(1)
        return row?.status ?? null
    },

    async findDetailById(
        id: number,
        executor: Executor = getDatabase()
    ) {
        const [row] = await executor
            .select({
                book: books,
                publisherName: publisherProfiles.publisherName,
                languageCode: languages.code,
                languageName: languages.name
            })
            .from(books)
            .innerJoin(publisherProfiles, eq(publisherProfiles.userId, books.publisherId))
            .innerJoin(languages, eq(languages.id, books.languageId))
            .where(eq(books.id, id))
            .limit(1)
        if (!row) return null

        const [bookAuthorRows, bookGenreRows, bookCategoryRows] = await Promise.all([
            executor
                .select({ id: authors.id, name: authors.name })
                .from(bookAuthors)
                .innerJoin(authors, eq(authors.id, bookAuthors.authorId))
                .where(eq(bookAuthors.bookId, id)),
            executor
                .select({ id: genres.id, name: genres.name })
                .from(bookGenres)
                .innerJoin(genres, eq(genres.id, bookGenres.genreId))
                .where(eq(bookGenres.bookId, id)),
            executor
                .select({ id: categories.id, name: categories.name })
                .from(bookCategories)
                .innerJoin(categories, eq(categories.id, bookCategories.categoryId))
                .where(eq(bookCategories.bookId, id))
        ])

        const { filePath: _filePath, ...book } = row.book

        return {
            ...book,
            publisherName: row.publisherName,
            language: { code: row.languageCode, name: row.languageName },
            authors: bookAuthorRows,
            genres: bookGenreRows,
            categories: bookCategoryRows
        }
    },

    async reviewIfPending(
        id: number,
        data: {
            status: 'approved' | 'rejected'
            reviewerId: number
            rejectionReason?: string
        },
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [result] = await executor
            .update(books)
            .set({
                status: data.status,
                reviewedBy: data.reviewerId,
                reviewedAt: new Date(),
                rejectionReason: data.rejectionReason ?? null
            })
            .where(and(eq(books.id, id), eq(books.status, 'pending')))
        return result.affectedRows > 0
    },

    async withdrawIfApproved(
        id: number,
        data: { reviewerId: number },
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [result] = await executor
            .update(books)
            .set({
                status: 'withdrawn',
                reviewedBy: data.reviewerId,
                reviewedAt: new Date()
            })
            .where(and(eq(books.id, id), eq(books.status, 'approved')))
        return result.affectedRows > 0
    },

    async removeFromCarts(
        bookId: number,
        executor: Executor = getDatabase()
    ): Promise<void> {
        await executor
            .delete(cartItems)
            .where(eq(cartItems.bookId, bookId))
    }
}
