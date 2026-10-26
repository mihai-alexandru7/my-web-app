import { wishlistRepository } from '#server/repositories/wishlistRepository'
import { cartRepository } from '#server/repositories/cartRepository'
import { bookRepository } from '#server/repositories/bookRepository'
import { getDatabase } from '#server/utils/database'

export const wishlistService = {
    async list(userId: number) {
        return wishlistRepository.list(userId)
    },

    async add(userId: number, bookId: number) {
        const status = await bookRepository.findStatus(bookId)
        if (!status || status !== 'approved') {
            throw createError({ statusCode: 400, message: 'This book is not available.' })
        }

        await wishlistRepository.create(userId, bookId)
        return { ok: true }
    },

    async remove(userId: number, bookId: number) {
        const deleted = await wishlistRepository.delete(userId, bookId)
        return { ok: deleted }
    },

    async moveToCart(userId: number, bookId: number) {
        const status = await bookRepository.findStatus(bookId)
        if (!status || status !== 'approved') {
            throw createError({ statusCode: 400, message: 'This book is not available for purchase.' })
        }

        await getDatabase().transaction(async (tx) => {
            await cartRepository.create(userId, bookId, tx)
            await wishlistRepository.delete(userId, bookId, tx)
        })

        return { ok: true }
    }
}