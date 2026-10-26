import { idParamSchema, categorySchema } from '#server/schemas/administration'
import { categoryService } from '#server/services/categoryService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = validatedParams(event, idParamSchema)
    const body = await validatedBody(event, categorySchema)
    return { category: await categoryService.update(id, body.name) }
})
