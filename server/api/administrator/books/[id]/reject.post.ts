import { idParamSchema, rejectBookSchema } from '#server/schemas/administrator.ts'
import { bookModerationService } from '#server/services/bookModerationService.ts'

export default defineEventHandler(async (event) => {
    const admin = await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    const { reason } = await readValidatedBody(event, rejectBookSchema.parse)
    return { book: await bookModerationService.reject(id, admin.id, reason) }
})
