import { idParamSchema } from '#server/schemas/administration'
import { reviewManagementService } from '#server/services/reviewManagementService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = validatedParams(event, idParamSchema)
    await reviewManagementService.remove(id)
    return { ok: true }
})
