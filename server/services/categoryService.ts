import { categoryRepository } from '../repositories/categoryRepository'
import { isDuplicateEntry } from '../utils/mysqlErrors'

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

    async remove(id: number) {
        const deleted = await categoryRepository.delete(id)
        if (!deleted) {
            throw createError({ statusCode: 404, message: 'Category not found.' })
        }
    },
}
