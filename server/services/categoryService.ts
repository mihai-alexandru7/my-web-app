import { categoryRepository } from '#server/repositories/categoryRepository'
import { isDuplicateEntry, isForeignKeyViolation } from '#server/utils/mysqlErrors'

export const categoryService = {
    list() {
        return categoryRepository.list()
    },

    async create(name: string) {
        try {
            const id = await categoryRepository.create(name)
            return { id, name }
        } catch (error) {
            if (isDuplicateEntry(error)) {
                throw createError({ statusCode: 409, message: `Category "${name}" already exists.` })
            }
            throw error
        }
    },

    async update(id: number, name: string) {
        const existing = await categoryRepository.findById(id)
        if (!existing) {
            throw createError({ statusCode: 404,  message: 'Category not found.' })
        }

        try {
            await categoryRepository.update(id, name)
            return { id, name }
        } catch (error) {
            if (isDuplicateEntry(error)) {
                throw createError({ statusCode: 409, message: `Category "${name}" already exists.` })
            }
            throw error
        }
    },

    async remove(id: number) {
        try {
            const deleted = await categoryRepository.delete(id)
            if (!deleted) {
                throw createError({ statusCode: 404, message: 'Category not found.' })
            }
        } catch (error) {
            if (isForeignKeyViolation(error)) {
                throw createError({ statusCode: 409, message: 'This category is used by existing books and cannot be deleted.' })
            }
            throw error
        }
    }
}
