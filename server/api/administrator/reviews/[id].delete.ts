import { idParamSchema } from '../../../schemas/administrator'
import { reviewModerationService } from '../../../services/reviewModerationService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    await reviewModerationService.remove(id)
    return { ok: true }
})
