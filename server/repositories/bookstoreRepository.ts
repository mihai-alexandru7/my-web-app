import { and, asc, count, desc, eq, gte, inArray, like, lte, or, sql } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import {
    books,
    authors,
    bookAuthors,
    bookGenres,
    bookCategories,
    genres,
    categories,
    languages,
    publisherProfiles,
    reviews,
    users,
    wishlistItems,
    cartItems,
    userLibrary,
    orderItems,
    orders
} from '#server/database/schema'
import type { BookstoreQuery } from '#server/schemas/bookstore'

export const bookstoreRepository = {
    async list(query: BookstoreQuery, executor: Executor = getDatabase()) {
        const offset = (query.page - 1) * query.pageSize
        const conditions = [eq(books.status, 'approved')]

        if (query.minPrice !== undefined) conditions.push(gte(books.price, String(query.minPrice)))
        if (query.maxPrice !== undefined) conditions.push(lte(books.price, String(query.maxPrice)))
        if (query.languageId !== undefined) conditions.push(eq(books.languageId, query.languageId))

        if (query.genreId !== undefined) {
            conditions.push(inArray(
                books.id,
                executor
                    .select({ bookId: bookGenres.bookId })
                    .from(bookGenres)
                    .where(eq(bookGenres.genreId, query.genreId))
            ))
        }

        if (query.categoryId !== undefined) {
            conditions.push(inArray(
                books.id,
                executor
                    .select({ bookId: bookCategories.bookId })
                    .from(bookCategories)
                    .where(eq(bookCategories.categoryId, query.categoryId))
            ))
        }

        if (query.search) {
            const pattern = `%${query.search.replace(/[\\%_]/g, '\\$&')}%`
            const authorMatches = executor
                .select({ bookId: bookAuthors.bookId })
                .from(bookAuthors)
                .innerJoin(authors, eq(authors.id, bookAuthors.authorId))
                .where(like(authors.name, pattern))

            conditions.push(or(
                like(books.title, pattern),
                inArray(books.id, authorMatches)
            )!)
        }

        const whereSql = and(...conditions)

        let orderByClause = desc(books.createdAt)
        if (query.sortBy === 'price-asc') orderByClause = asc(books.price)
        if (query.sortBy === 'price-desc') orderByClause = desc(books.price)
        if (query.sortBy === 'title') orderByClause = asc(books.title)

        const [items, totalRow] = await Promise.all([
            executor
                .select({
                    id: books.id,
                    title: books.title,
                    price: books.price,
                    coverPath: books.coverPath,
                    samplePath: books.samplePath,
                    publishedYear: books.publishedYear,
                    createdAt: books.createdAt,
                    publisherName: publisherProfiles.publisherName,
                    languageName: languages.name
                })
                .from(books)
                .innerJoin(publisherProfiles, eq(publisherProfiles.userId, books.publisherId))
                .innerJoin(languages, eq(languages.id, books.languageId))
                .where(whereSql)
                .orderBy(orderByClause, desc(books.id))
                .limit(query.pageSize)
                .offset(offset),
            executor
                .select({ total: count() })
                .from(books)
                .where(whereSql)
        ])

        if (items.length === 0) {
            return { items: [], total: totalRow[0]?.total ?? 0 }
        }

        const bookIds = items.map(b => b.id)
        const authorRows = await executor
            .select({
                bookId: bookAuthors.bookId,
                authorName: authors.name
            })
            .from(bookAuthors)
            .innerJoin(authors, eq(authors.id, bookAuthors.authorId))
            .where(inArray(bookAuthors.bookId, bookIds))

        const authorsByBook = new Map<number, string[]>()
        for (const row of authorRows) {
            const list = authorsByBook.get(row.bookId) || []
            list.push(row.authorName)
            authorsByBook.set(row.bookId, list)
        }

        const enrichedItems = items.map(item => ({
            ...item,
            authors: authorsByBook.get(item.id) || []
        }))

        return { items: enrichedItems, total: totalRow[0]?.total ?? 0 }
    },

    async findPublicDetail(id: number, currentUserId?: number, executor: Executor = getDatabase()) {
        const [bookRow] = await executor
            .select({
                id: books.id,
                title: books.title,
                description: books.description,
                price: books.price,
                coverPath: books.coverPath,
                samplePath: books.samplePath,
                isbn: books.isbn,
                publishedYear: books.publishedYear,
                createdAt: books.createdAt,
                publisherName: publisherProfiles.publisherName,
                language: { id: languages.id, code: languages.code, name: languages.name }
            })
            .from(books)
            .innerJoin(publisherProfiles, eq(publisherProfiles.userId, books.publisherId))
            .innerJoin(languages, eq(languages.id, books.languageId))
            .where(and(eq(books.id, id), eq(books.status, 'approved')))
            .limit(1)

        if (!bookRow) return null

        const [authorsList, genresList, categoriesList, reviewStats, bookReviews] = await Promise.all([
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
                .where(eq(bookCategories.bookId, id)),
            executor
                .select({
                    ratingCount: count(reviews.rating),
                    avgRating: sql<string>`cast(coalesce(avg(${reviews.rating}), 0) as decimal(3,2))`
                })
                .from(reviews)
                .where(eq(reviews.bookId, id)),
            executor
                .select({
                    id: reviews.id,
                    rating: reviews.rating,
                    comment: reviews.comment,
                    createdAt: reviews.createdAt,
                    userName: sql<string>`concat(${users.firstName}, ' ', substring(${users.lastName}, 1, 1), '.')`
                })
                .from(reviews)
                .innerJoin(users, eq(users.id, reviews.userId))
                .where(eq(reviews.bookId, id))
                .orderBy(desc(reviews.createdAt))
                .limit(20)
        ])

        let userState = { inWishlist: false, inCart: false, isPurchased: false }
        if (currentUserId) {
            const [w, c, l] = await Promise.all([
                executor.select({ id: wishlistItems.bookId }).from(wishlistItems).where(and(eq(wishlistItems.userId, currentUserId), eq(wishlistItems.bookId, id))).limit(1),
                executor.select({ id: cartItems.bookId }).from(cartItems).where(and(eq(cartItems.userId, currentUserId), eq(cartItems.bookId, id))).limit(1),
                executor.select({ id: userLibrary.bookId }).from(userLibrary).where(and(eq(userLibrary.userId, currentUserId), eq(userLibrary.bookId, id))).limit(1)
            ])
            userState = {
                inWishlist: w.length > 0,
                inCart: c.length > 0,
                isPurchased: l.length > 0
            }
        }

        return {
            ...bookRow,
            authors: authorsList,
            genres: genresList,
            categories: categoriesList,
            rating: {
                average: Number(reviewStats[0]?.avgRating ?? 0),
                count: Number(reviewStats[0]?.ratingCount ?? 0)
            },
            reviews: bookReviews,
            userState
        }
    },

    async getFeatured(limit = 10, executor: Executor = getDatabase()) {
        async function enrichWithAuthors(bookRows: any[]) {
            if (!bookRows.length) return []
            const bookIdentifiers = bookRows.map(book => book.id)

            const authorRows = await executor
                .select({
                    bookId: bookAuthors.bookId,
                    authorName: authors.name
                })
                .from(bookAuthors)
                .innerJoin(authors, eq(authors.id, bookAuthors.authorId))
                .where(inArray(bookAuthors.bookId, bookIdentifiers))

            const authorMap = new Map<number, string[]>()
            for (const row of authorRows) {
                const list = authorMap.get(row.bookId) || []
                list.push(row.authorName)
                authorMap.set(row.bookId, list)
            }

            return bookRows.map(book => ({
                ...book,
                authors: authorMap.get(book.id) || []
            }))
        }

        const newReleasesQuery = executor
            .select({
                id: books.id,
                title: books.title,
                price: books.price,
                coverPath: books.coverPath,
                createdAt: books.createdAt
            })
            .from(books)
            .where(eq(books.status, 'approved'))
            .orderBy(desc(books.createdAt), desc(books.id))
            .limit(limit)

        const bestSellersQuery = executor
            .select({
                id: books.id,
                title: books.title,
                price: books.price,
                coverPath: books.coverPath,
                salesCount: sql<number>`cast(count(${orderItems.id}) as unsigned)`
            })
            .from(books)
            .leftJoin(orderItems, eq(orderItems.bookId, books.id))
            .leftJoin(orders, and(eq(orders.id, orderItems.orderId), eq(orders.status, 'paid')))
            .where(eq(books.status, 'approved'))
            .groupBy(books.id, books.title, books.price, books.coverPath)
            .orderBy(desc(sql`count(${orderItems.id})`), desc(books.createdAt))
            .limit(limit)

        const topPicksQuery = executor
            .select({
                id: books.id,
                title: books.title,
                price: books.price,
                coverPath: books.coverPath,
                averageScore: sql<number>`cast(coalesce(avg(${reviews.rating}), 5.0) as decimal(3,2))`
            })
            .from(books)
            .leftJoin(reviews, eq(reviews.bookId, books.id))
            .where(eq(books.status, 'approved'))
            .groupBy(books.id, books.title, books.price, books.coverPath)
            .orderBy(desc(sql`coalesce(avg(${reviews.rating}), 0)`), desc(books.createdAt))
            .limit(limit)

        const [newReleasesRows, bestSellersRows, topPicksRows] = await Promise.all([
            newReleasesQuery,
            bestSellersQuery,
            topPicksQuery
        ])

        const [newReleases, bestSellers, topPicks] = await Promise.all([
            enrichWithAuthors(newReleasesRows),
            enrichWithAuthors(bestSellersRows),
            enrichWithAuthors(topPicksRows)
        ])

        return {
            topPicks,
            newReleases,
            bestSellers
        }
    },

    async getOverview(booksPerGenre = 10, executor: Executor = getDatabase()) {
        const activeGenres = await executor
            .select({
                id: genres.id,
                name: genres.name
            })
            .from(genres)
            .innerJoin(bookGenres, eq(bookGenres.genreId, genres.id))
            .innerJoin(books, and(eq(books.id, bookGenres.bookId), eq(books.status, 'approved')))
            .groupBy(genres.id, genres.name)
            .orderBy(asc(genres.name))

        const results = await Promise.all(
            activeGenres.map(async (genre) => {
                const genreBooks = await executor
                    .select({
                        id: books.id,
                        title: books.title,
                        price: books.price,
                        coverPath: books.coverPath
                    })
                    .from(books)
                    .innerJoin(bookGenres, and(eq(bookGenres.bookId, books.id), eq(bookGenres.genreId, genre.id)))
                    .where(eq(books.status, 'approved'))
                    .orderBy(desc(books.createdAt))
                    .limit(booksPerGenre)

                const bookIds = genreBooks.map(b => b.id)
                let enrichedBooks = genreBooks

                if (bookIds.length > 0) {
                    const authorRows = await executor
                        .select({
                            bookId: bookAuthors.bookId,
                            authorName: authors.name
                        })
                        .from(bookAuthors)
                        .innerJoin(authors, eq(authors.id, bookAuthors.authorId))
                        .where(inArray(bookAuthors.bookId, bookIds))

                    const authorMap = new Map<number, string[]>()
                    for (const row of authorRows) {
                        const list = authorMap.get(row.bookId) || []
                        list.push(row.authorName)
                        authorMap.set(row.bookId, list)
                    }

                    enrichedBooks = genreBooks.map(b => ({
                        ...b,
                        authors: authorMap.get(b.id) || []
                    }))
                }

                return {
                    id: genre.id,
                    name: genre.name,
                    books: enrichedBooks
                }
            })
        )

        return results.filter(group => group.books.length > 0)
    }
}