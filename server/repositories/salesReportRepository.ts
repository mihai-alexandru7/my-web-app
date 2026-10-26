import { and, asc, count, countDistinct, desc, eq, gte, lt, sql } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { books, orderItems, orders } from '#server/database/schema'

export type SalesFilter = {
    publisherId: number
    bookId?: number
    from?: Date
    to?: Date
}

function paidInWindow(filter: SalesFilter) {
    return and(
        eq(orders.status, 'paid'),
        filter.from ? gte(orders.createdAt, filter.from) : undefined,
        filter.to ? lt(orders.createdAt, filter.to) : undefined
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
