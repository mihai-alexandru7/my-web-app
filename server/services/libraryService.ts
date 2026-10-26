import { libraryRepository } from '#server/repositories/libraryRepository'
import { bookRepository } from '#server/repositories/bookRepository'
import { sendStoredFile } from '#server/utils/fileStorage'
import type { H3Event } from 'h3'

export const libraryService = {
    async list(userId: number) {
        return libraryRepository.list(userId)
    },

    async getBookProgress(userId: number, bookId: number) {
        const item = await libraryRepository.findById(userId, bookId)
        if (!item) {
            throw createError({ statusCode: 404, message: 'Book not found in your library.' })
        }
        return {
            lastPosition: item.lastPosition,
            lastReadAt: item.lastReadAt
        }
    },

    async updateProgress(userId: number, bookId: number, lastPosition: string) {
        const updated = await libraryRepository.update(userId, bookId, {
            lastPosition,
            lastReadAt: new Date()
        })
        if (!updated) {
            throw createError({ statusCode: 404, message: 'Book not found in your library.' })
        }
        return { ok: true }
    },

    async streamBookContent(event: H3Event, userId: number, bookId: number) {
        const hasPurchased = await libraryRepository.hasPurchased(userId, bookId)
        if (!hasPurchased) {
            throw createError({ statusCode: 403, message: 'You must purchase this book before reading it.' })
        }

        const book = await bookRepository.findFilePaths(bookId)
        if (!book || !book.filePath) {
            throw createError({ statusCode: 404, message: 'Book file not found.' })
        }

        return sendStoredFile(event, book.filePath, {
            disposition: 'inline',
            cacheControl: 'private, no-cache'
        })
    }
}