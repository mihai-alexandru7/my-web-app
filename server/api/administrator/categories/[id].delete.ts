import { idParamSchema } from '../../../schemas/administrator'
import { categoryService } from '../../../services/categoryService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    await categoryService.remove(id)
    return { ok: true }
})
