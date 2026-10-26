import { idParamSchema } from '#server/schemas/administration'
import { bookManagementService } from '#server/services/bookManagementService'

export default defineEventHandler(async (event) => {
    const administrator = await requireRole(event, 'administrator')
    const { id } = validatedParams(event, idParamSchema)
    return { book: await bookManagementService.withdraw(id, administrator.id) }
})
