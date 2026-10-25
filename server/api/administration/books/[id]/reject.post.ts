import { idParamSchema, rejectBookSchema } from '#server/schemas/administration'
import { bookManagementService } from '#server/services/bookManagementService'

export default defineEventHandler(async (event) => {
    const administrator = await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    const { reason } = await readValidatedBody(event, rejectBookSchema.parse)
    return { book: await bookManagementService.reject(id, administrator.id, reason) }
})
