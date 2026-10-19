import { categoryService } from '../../services/categoryService'

export default defineEventHandler(async () => {
    return { categories: await categoryService.list() }
})
