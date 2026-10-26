import { bookstoreRepository } from '#server/repositories/bookstoreRepository'
import { bookRepository } from '#server/repositories/bookRepository'
import { sendStoredFile } from '#server/utils/fileStorage'
import type { BookstoreQuery } from '#server/schemas/bookstore'
import type { H3Event } from 'h3'

export const bookstoreService = {
    async list(query: BookstoreQuery) {
        return bookstoreRepository.list(query)
    },

    async getDetail(id: number, currentUserId?: number) {
        const book = await bookstoreRepository.findPublicDetail(id, currentUserId)
        if (!book) {
            throw createError({ statusCode: 404, message: 'Book not found or is not available for purchase.' })
        }
        return book
    },

    async getFeatured(limit = 10) {
        return bookstoreRepository.getFeatured(limit)
    },

    async getOverview(limit = 10) {
        return bookstoreRepository.getOverview(limit)
    },

    async streamSample(event: H3Event, id: number) {
        const book = await bookRepository.findFilePaths(id)
        if (!book || book.status !== 'approved' || !book.samplePath) {
            throw createError({ statusCode: 404, message: 'Free sample is not available for this book.' })
        }

        return sendStoredFile(event, book.samplePath, {
            cacheControl: 'public, max-age=86400',
            disposition: 'inline'
        })
    }
}