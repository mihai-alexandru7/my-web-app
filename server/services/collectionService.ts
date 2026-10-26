import { collectionRepository } from '#server/repositories/collectionRepository'
import { libraryRepository } from '#server/repositories/libraryRepository'
import { isDuplicateEntry } from '#server/utils/mysqlErrors'
import type { CollectionInput } from '#server/schemas/library'

export const collectionService = {
    async list(userId: number) {
        return collectionRepository.list(userId)
    },

    async getDetail(userId: number, collectionId: number) {
        const collection = await collectionRepository.findById(userId, collectionId)
        if (!collection) {
            throw createError({ statusCode: 404, message: 'Collection not found.' })
        }

        const books = await collectionRepository.listBooks(userId, collectionId)
        return { ...collection, books }
    },

    async create(userId: number, input: CollectionInput) {
        try {
            const id = await collectionRepository.create(userId, input)
            return { id, name: input.name }
        } catch (error) {
            if (isDuplicateEntry(error)) {
                throw createError({ statusCode: 409, message: `A collection named "${input.name}" already exists.` })
            }
            throw error
        }
    },

    async update(userId: number, collectionId: number, input: CollectionInput) {
        const collection = await collectionRepository.findById(userId, collectionId)
        if (!collection) {
            throw createError({ statusCode: 404, message: 'Collection not found.' })
        }

        try {
            await collectionRepository.update(userId, collectionId, input)
            return { id: collectionId, name: input.name }
        } catch (error) {
            if (isDuplicateEntry(error)) {
                throw createError({ statusCode: 409, message: `A collection named "${input.name}" already exists.` })
            }
            throw error
        }
    },

    async remove(userId: number, collectionId: number) {
        const deleted = await collectionRepository.delete(userId, collectionId)
        if (!deleted) {
            throw createError({ statusCode: 404, message: 'Collection not found.' })
        }
        return { ok: true }
    },

    async addBook(userId: number, collectionId: number, bookId: number) {
        const collection = await collectionRepository.findById(userId, collectionId)
        if (!collection) {
            throw createError({ statusCode: 404, message: 'Collection not found.' })
        }

        const hasPurchased = await libraryRepository.hasPurchased(userId, bookId)
        if (!hasPurchased) {
            throw createError({ statusCode: 403, message: 'You can only add purchased books to your collections.' })
        }

        await collectionRepository.addBook(userId, collectionId, bookId)
        return { ok: true }
    },

    async removeBook(userId: number, collectionId: number, bookId: number) {
        const deleted = await collectionRepository.removeBook(userId, collectionId, bookId)
        if (!deleted) {
            throw createError({ statusCode: 404, message: 'Book was not found in this collection.' })
        }
        return { ok: true }
    }
}