import { idParamSchema } from '#server/schemas/administrator.ts'
import { bookModerationService } from '#server/services/bookModerationService.ts'

export default defineEventHandler(async (event) => {
    const admin = await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    return { book: await bookModerationService.approve(id, admin.id) }
})
