import { categoryService } from '#server/services/categoryService'

export default defineEventHandler(async () => {
    return { categories: await categoryService.list() }
})
