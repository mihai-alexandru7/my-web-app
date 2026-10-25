import { genreRepository } from '#server/repositories/genreRepository'
import { isDuplicateEntry, isForeignKeyViolation } from '#server/utils/mysqlErrors'

export const genreService = {
    list() {
        return genreRepository.list()
    },

    async create(name: string) {
        try {
            const id = await genreRepository.create(name)
            return { id, name }
        } catch (error) {
            if (isDuplicateEntry(error)) {
                throw createError({ statusCode: 409, message: `Genre "${name}" already exists.` })
            }
            throw error
        }
    },

    async update(id: number, name: string) {
        const existing = await genreRepository.findById(id)
        if (!existing) {
            throw createError({ statusCode: 404, message: 'Genre not found.' })
        }

        try {
            await genreRepository.update(id, name)
            return { id, name }
        } catch (error) {
            if (isDuplicateEntry(error)) {
                throw createError({ statusCode: 409, message: `Genre "${name}" already exists.` })
            }
            throw error
        }
    },

    async remove(id: number) {
        try {
            const deleted = await genreRepository.delete(id)
            if (!deleted) {
                throw createError({ statusCode: 404, message: 'Genre not found.' })
            }
        } catch (error) {
            if (isForeignKeyViolation(error)) {
                throw createError({ statusCode: 409, message: 'This genre is used by existing books and cannot be deleted.' })
            }
            throw error
        }
    }
}
