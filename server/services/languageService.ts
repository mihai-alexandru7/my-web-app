import { languageRepository } from '#server/repositories/languageRepository'
import { isDuplicateEntry, isForeignKeyViolation } from '#server/utils/mysqlErrors'

function duplicateCodeError(code?: string) {
    return createError({ statusCode: 409, message: code ? `A language with code "${code}" already exists.` : 'A language with this code already exists.' })
}

export const languageService = {
    list() {
        return languageRepository.list()
    },

    async create(input: { code: string; name: string }) {
        try {
            const id = await languageRepository.create(input)
            return { id, ...input }
        } catch (error) {
            if (isDuplicateEntry(error)) {
                throw duplicateCodeError(input.code)
            }
            throw error
        }
    },

    async update(id: number, input: { code?: string; name?: string }) {
        const existing = await languageRepository.findById(id)
        if (!existing) {
            throw createError({ statusCode: 404, message: 'Language not found.' })
        }

        try {
            await languageRepository.update(id, input)
            return { ...existing, ...input }
        } catch (error) {
            if (isDuplicateEntry(error)) {
                throw duplicateCodeError(input.code)
            }
            throw error
        }
    },

    async remove(id: number) {
        try {
            const deleted = await languageRepository.delete(id)
            if (!deleted) {
                throw createError({ statusCode: 404, message: 'Language not found.' })
            }
        } catch (error) {
            if (isForeignKeyViolation(error)) {
                throw createError({ statusCode: 409, message: 'This language is used by existing books and cannot be deleted.' })
            }
            throw error
        }
    }
}
