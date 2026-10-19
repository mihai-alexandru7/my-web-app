import { genreRepository } from '../repositories/genreRepository'
import { isDuplicateEntry } from '../utils/mysqlErrors'

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

    async remove(id: number) {
        const deleted = await genreRepository.delete(id)
        if (!deleted) {
            throw createError({ statusCode: 404, message: 'Genre not found.' })
        }
    },
}
