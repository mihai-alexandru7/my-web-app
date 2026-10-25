import { idParamSchema } from '#server/schemas/administration'
import { categoryService } from '#server/services/categoryService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    await categoryService.remove(id)
    return { ok: true }
})
