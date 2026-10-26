import { categorySchema } from '#server/schemas/administration'
import { categoryService } from '#server/services/categoryService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const body = await validatedBody(event, categorySchema)
    const category = await categoryService.create(body.name)
    setResponseStatus(event, 201)
    return { category }
})
