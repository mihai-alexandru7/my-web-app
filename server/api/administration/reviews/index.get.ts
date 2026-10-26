import { reviewListQuerySchema } from '#server/schemas/administration'
import { reviewManagementService } from '#server/services/reviewManagementService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { page, pageSize, ...filter } = validatedQuery(event, reviewListQuerySchema)
    return reviewManagementService.list(filter, page, pageSize)
})
