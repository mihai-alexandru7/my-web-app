import { desc, eq } from 'drizzle-orm'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { orders, orderItems, books } from '#server/database/schema'

export type OrderStatus = typeof orders.$inferSelect['status']

export type UpdateOrderData = {
    status?: OrderStatus
    paymentMethod?: string
    paymentRef?: string | null
}

export const orderRepository = {
    async findById(orderId: number, executor: Executor = getDatabase()) {
        const [order] = await executor
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1)
        return order ?? null
    },

    async listByUser(userId: number, executor: Executor = getDatabase()) {
        return executor
            .select()
            .from(orders)
            .where(eq(orders.userId, userId))
            .orderBy(desc(orders.createdAt))
    },

    async listOrderItems(orderId: number, executor: Executor = getDatabase()) {
        return executor
            .select({
                id: orderItems.id,
                bookId: orderItems.bookId,
                title: books.title,
                priceAtPurchase: orderItems.priceAtPurchase
            })
            .from(orderItems)
            .innerJoin(books, eq(books.id, orderItems.bookId))
            .where(eq(orderItems.orderId, orderId))
    },

    async create(
        data: { userId: number; totalAmount: string; paymentMethod?: string; paymentRef?: string; status?: OrderStatus },
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [res] = await executor
            .insert(orders)
            .values({
                userId: data.userId,
                totalAmount: data.totalAmount,
                paymentMethod: data.paymentMethod ?? 'card',
                paymentRef: data.paymentRef ?? null,
                status: data.status ?? 'paid'
            })
            .$returningId()
        return res.id
    },

    async createItem(
        data: { orderId: number; bookId: number; priceAtPurchase: string },
        executor: Executor = getDatabase()
    ): Promise<number> {
        const [res] = await executor
            .insert(orderItems)
            .values(data)
            .$returningId()
        return res.id
    },

    async update(orderId: number, data: UpdateOrderData, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .update(orders)
            .set(data)
            .where(eq(orders.id, orderId))
        return res.affectedRows > 0
    },

    async delete(orderId: number, executor: Executor = getDatabase()): Promise<boolean> {
        const [res] = await executor
            .delete(orders)
            .where(eq(orders.id, orderId))
        return res.affectedRows > 0
    }
}