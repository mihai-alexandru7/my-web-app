import { idParamSchema, rejectBookSchema } from '#server/schemas/administration'
import { bookManagementService } from '#server/services/bookManagementService'

export default defineEventHandler(async (event) => {
    const administrator = await requireRole(event, 'administrator')
    const { id } = validatedParams(event, idParamSchema)
    const { reason } = await validatedBody(event, rejectBookSchema)
    return { book: await bookManagementService.reject(id, administrator.id, reason) }
})
