import { and, asc, count, countDistinct, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { books, orderItems, orders } from '#server/database/schema'

export type SalesFilter = {
    publisherId: number
    bookId?: number
    from?: Date | string
    to?: Date | string
}

function parseWindowDates(filter: SalesFilter) {
    let fromDate: Date | undefined
    let toDate: Date | undefined

    if (filter.from) {
        fromDate = filter.from instanceof Date ? filter.from : new Date(`${filter.from}T00:00:00.000Z`)
    }
    if (filter.to) {
        // Asigură includerea întregii zile de final
        toDate = filter.to instanceof Date ? filter.to : new Date(`${filter.to}T23:59:59.999Z`)
    }

    return { fromDate, toDate }
}

function paidInWindow(filter: SalesFilter) {
    const { fromDate, toDate } = parseWindowDates(filter)
    return and(
        eq(orders.status, 'paid'),
        fromDate ? gte(orders.createdAt, fromDate) : undefined,
        toDate ? lte(orders.createdAt, toDate) : undefined
    )
}

const money = (column: typeof orderItems.priceAtPurchase) =>
    sql<string>`cast(coalesce(sum(${column}), 0) as decimal(14,2))`

export const salesReportRepository = {
    async summary(filter: SalesFilter, executor: Executor = getDatabase()) {
        const [row] = await executor
            .select({
                unitsSold: count(),
                orders: countDistinct(orders.id),
                revenue: money(orderItems.priceAtPurchase)
            })
            .from(orderItems)
            .innerJoin(orders, eq(orders.id, orderItems.orderId))
            .innerJoin(books, eq(books.id, orderItems.bookId))
            .where(and(
                eq(books.publisherId, filter.publisherId),
                filter.bookId ? eq(books.id, filter.bookId) : undefined,
                paidInWindow(filter)
            ))
        return row ?? { unitsSold: 0, orders: 0, revenue: '0.00' }
    },

    async byBook(filter: SalesFilter, executor: Executor = getDatabase()) {
        const revenue = sql<string>`cast(coalesce(sum(case when ${orders.id} is not null then ${orderItems.priceAtPurchase} end), 0) as decimal(14,2))`
        return executor
            .select({
                bookId: books.id,
                title: books.title,
                status: books.status,
                currentPrice: books.price,
                unitsSold: count(orders.id),
                revenue
            })
            .from(books)
            .leftJoin(orderItems, eq(orderItems.bookId, books.id))
            .leftJoin(orders, and(eq(orders.id, orderItems.orderId), paidInWindow(filter)))
            .where(and(
                eq(books.publisherId, filter.publisherId),
                filter.bookId ? eq(books.id, filter.bookId) : undefined
            ))
            .groupBy(books.id, books.title, books.status, books.price)
            .orderBy(desc(revenue), asc(books.id))
    },

    async byMonth(filter: SalesFilter, executor: Executor = getDatabase()) {
        const month = sql<string>`date_format(${orders.createdAt}, '%Y-%m')`
        return executor
            .select({
                month,
                unitsSold: count(),
                revenue: money(orderItems.priceAtPurchase)
            })
            .from(orderItems)
            .innerJoin(orders, eq(orders.id, orderItems.orderId))
            .innerJoin(books, eq(books.id, orderItems.bookId))
            .where(and(
                eq(books.publisherId, filter.publisherId),
                filter.bookId ? eq(books.id, filter.bookId) : undefined,
                paidInWindow(filter)
            ))
            .groupBy(month)
            .orderBy(asc(month))
    }
}