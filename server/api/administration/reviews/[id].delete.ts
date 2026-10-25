import { idParamSchema } from '#server/schemas/administration'
import { reviewManagementService } from '#server/services/reviewManagementService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    await reviewManagementService.remove(id)
    return { ok: true }
})
