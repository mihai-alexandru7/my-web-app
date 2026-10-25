import { idParamSchema, categorySchema } from '#server/schemas/administration'
import { categoryService } from '#server/services/categoryService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    const body = await readValidatedBody(event, categorySchema.parse)
    return { category: await categoryService.update(id, body.name) }
})
