import { and, count, desc, eq, inArray, like } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import {
    authors,
    bookAuthors,
    bookCategories,
    bookGenres,
    books,
    categories,
    genres
} from '#server/database/schema'

export type BookStatus = typeof books.$inferSelect['status']
export type BookFilter = { status?: BookStatus; search?: string }
export type BookColumns = {
    title?: string
    description?: string | null
    price?: string
    languageId?: number
    isbn?: string | null
    publishedYear?: number | null
    status?: BookStatus
    rejectionReason?: string | null
    reviewedBy?: number | null
    reviewedAt?: Date | null
    coverPath?: string | null
    samplePath?: string | null
    filePath?: string
    updatedAt?: Date
}

function escapeLike(value: string) {
    return value.replace(/[\\%_]/g, '\\$&')
}

function whereClause(publisherId: number, filter: BookFilter) {
    return and(
        eq(books.publisherId, publisherId),
        filter.status ? eq(books.status, filter.status) : undefined,
        filter.search ? like(books.title, `%${escapeLike(filter.search)}%`) : undefined,
    )
}

export const publisherBookRepository = {
    async list(
        publisherId: number,
        filter: BookFilter,
        options: { limit: number; offset: number },
        executor: Executor = getDatabase(),
    ) {
        return executor
            .select({
                id: books.id,
                title: books.title,
                price: books.price,
                status: books.status,
                coverPath: books.coverPath,
                samplePath: books.samplePath,
                isbn: books.isbn,
                publishedYear: books.publishedYear,
                rejectionReason: books.rejectionReason,
                createdAt: books.createdAt,
                updatedAt: books.updatedAt
            })
            .from(books)
            .where(whereClause(publisherId, filter))
            .orderBy(desc(books.createdAt), desc(books.id))
            .limit(options.limit)
            .offset(options.offset)
    },

    async count(
        publisherId: number,
        filter: BookFilter,
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [row] = await executor
            .select({ total: count() })
            .from(books)
            .where(whereClause(publisherId, filter))
        return row?.total ?? 0
    },

    async findOwnedStatus(
        id: number,
        publisherId: number,
        executor: Executor = getDatabase()
    ): Promise<BookStatus | null> {
        const [row] = await executor
            .select({ status: books.status })
            .from(books)
            .where(and(eq(books.id, id), eq(books.publisherId, publisherId)))
            .limit(1)
        return row?.status ?? null
    },

    async findOwnedForUpdate(
        id: number,
        publisherId: number,
        executor: Executor = getDatabase()
    ) {
        const [row] = await executor
            .select({
                id: books.id,
                status: books.status,
                filePath: books.filePath,
                coverPath: books.coverPath,
                samplePath: books.samplePath
            })
            .from(books)
            .where(and(eq(books.id, id), eq(books.publisherId, publisherId)))
            .limit(1)
            .for('update')
        return row ?? null
    },

    async insert(
        data: {
            publisherId: number
            languageId: number
            title: string
            description?: string
            price: string
            filePath: string
            coverPath?: string
            samplePath?: string
            isbn?: string
            publishedYear?: number
        },
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [created] = await executor
            .insert(books)
            .values({
                publisherId: data.publisherId,
                languageId: data.languageId,
                title: data.title,
                description: data.description ?? null,
                price: data.price,
                filePath: data.filePath,
                coverPath: data.coverPath ?? null,
                samplePath: data.samplePath ?? null,
                isbn: data.isbn ?? null,
                publishedYear: data.publishedYear ?? null
            })
            .$returningId()
        return created.id
    },

    async update(
        id: number,
        data: BookColumns,
        executor: Executor = getDatabase()
    ): Promise<void> {
        await executor
            .update(books)
            .set(data)
            .where(eq(books.id, id))
    },

    async withdrawIfActive(
        id: number,
        publisherId: number,
        executor: Executor = getDatabase()
    ): Promise<boolean> {
        const [result] = await executor
            .update(books)
            .set({ status: 'withdrawn' })
            .where(and(
                eq(books.id, id),
                eq(books.publisherId, publisherId),
                inArray(books.status, ['pending', 'approved'])
            ))
        return result.affectedRows > 0
    },

    async findAuthorIdByName(
        name: string,
        executor: Executor = getDatabase()
    ): Promise<number | null> {
        const [row] = await executor
            .select({ id: authors.id })
            .from(authors)
            .where(eq(authors.name, name))
            .limit(1)
        return row?.id ?? null
    },

    async createAuthor(
        name: string,
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [created] = await executor
            .insert(authors)
            .values({ name })
            .$returningId()
        return created.id
    },

    async countGenres(
        ids: number[],
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [row] = await executor
            .select({ total: count() })
            .from(genres)
            .where(inArray(genres.id, ids))
        return row?.total ?? 0
    },

    async countCategories(
        ids: number[],
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [row] = await executor
            .select({ total: count() })
            .from(categories)
            .where(inArray(categories.id, ids))
        return row?.total ?? 0
    },

    async replaceAuthors(
        bookId: number,
        authorIds: number[],
        executor: Executor = getDatabase()
    ): Promise<void> {
        await executor
            .delete(bookAuthors)
            .where(eq(bookAuthors.bookId, bookId))
        if (authorIds.length) {
            await executor
                .insert(bookAuthors)
                .values(authorIds.map((authorId) => ({ bookId, authorId })))
        }
    },

    async replaceGenres(
        bookId: number,
        genreIds: number[],
        executor: Executor = getDatabase()
    ): Promise<void> {
        await executor
            .delete(bookGenres)
            .where(eq(bookGenres.bookId, bookId))
        if (genreIds.length) {
            await executor
                .insert(bookGenres)
                .values(genreIds.map((genreId) => ({ bookId, genreId })))
        }
    },

    async replaceCategories(
        bookId: number,
        categoryIds: number[],
        executor: Executor = getDatabase()
    ): Promise<void> {
        await executor
            .delete(bookCategories)
            .where(eq(bookCategories.bookId, bookId))
        if (categoryIds.length) {
            await executor
                .insert(bookCategories)
                .values(categoryIds.map((categoryId) => ({ bookId, categoryId })))
        }
    }
}
