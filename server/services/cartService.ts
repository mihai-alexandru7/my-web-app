import { cartRepository } from '#server/repositories/cartRepository'
import { wishlistRepository } from '#server/repositories/wishlistRepository'
import { bookRepository } from '#server/repositories/bookRepository'
import { libraryRepository } from '#server/repositories/libraryRepository'
import { orderRepository } from '#server/repositories/orderRepository'
import { getDatabase } from '#server/utils/database'

export const cartService = {
    async list(userId: number) {
        const items = await cartRepository.list(userId)
        const total = items
            .reduce((sum, item) => sum + Number(item.price), 0)
            .toFixed(2)

        return {
            items,
            count: items.length,
            total
        }
    },

    async add(userId: number, bookId: number) {
        const status = await bookRepository.findStatus(bookId)
        if (!status || status !== 'approved') {
            throw createError({ statusCode: 400, message: 'Book is not available for purchase.' })
        }

        const alreadyOwned = await libraryRepository.hasPurchased(userId, bookId)
        if (alreadyOwned) {
            throw createError({ statusCode: 409, message: 'You already own this book.' })
        }

        await cartRepository.create(userId, bookId)
        return { ok: true }
    },

    async remove(userId: number, bookId: number) {
        const deleted = await cartRepository.delete(userId, bookId)
        return { ok: deleted }
    },

    async clear(userId: number) {
        await cartRepository.deleteAll(userId)
        return { ok: true }
    },

    async checkout(userId: number, paymentMethod = 'card') {
        return getDatabase().transaction(async (tx) => {
            const items = await cartRepository.listForCheckout(userId, tx)
            if (items.length === 0) {
                throw createError({ statusCode: 400, message: 'Your cart is empty.' })
            }

            for (const item of items) {
                if (item.status !== 'approved') {
                    throw createError({
                        statusCode: 409,
                        message: `Book ID ${item.bookId} is no longer available for purchase.`
                    })
                }
            }

            const totalAmount = items
                .reduce((sum, i) => sum + Number(i.price), 0)
                .toFixed(2)

            const orderId = await orderRepository.create(
                {
                    userId,
                    totalAmount,
                    paymentMethod,
                    status: 'paid'
                },
                tx
            )

            for (const item of items) {
                const orderItemId = await orderRepository.createItem(
                    {
                        orderId,
                        bookId: item.bookId,
                        priceAtPurchase: item.price
                    },
                    tx
                )

                await libraryRepository.create(
                    {
                        userId,
                        bookId: item.bookId,
                        orderItemId
                    },
                    tx
                )
            }

            await cartRepository.deleteAll(userId, tx)
            await wishlistRepository.deleteMany(userId, items.map(i => i.bookId), tx)

            return {
                orderId,
                totalAmount,
                itemsCount: items.length
            }
        })
    }
}