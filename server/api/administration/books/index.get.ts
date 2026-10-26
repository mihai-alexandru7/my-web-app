import { bookListQuerySchema } from '#server/schemas/administration'
import { bookManagementService } from '#server/services/bookManagementService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { status, page, pageSize } = validatedQuery(event, bookListQuerySchema)
    return bookManagementService.list(status, page, pageSize)
})
