import { categorySchema } from '../../../schemas/administrator'
import { categoryService } from '../../../services/categoryService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const body = await readValidatedBody(event, categorySchema.parse)
    const category = await categoryService.create(body.name)
    setResponseStatus(event, 201)
    return { category }
})
