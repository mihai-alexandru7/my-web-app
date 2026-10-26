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
        // The book_genres join table cascades, so without this check a
        // genre in use would silently disappear from every book instead of being refused.
        const inUse = await genreRepository.countBooks(id)
        if (inUse > 0) {
            throw createError({
                statusCode: 409,
                message: `This genre is used by ${inUse} ${inUse === 1 ? 'book' : 'books'} and cannot be deleted.`
            })
        }

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
