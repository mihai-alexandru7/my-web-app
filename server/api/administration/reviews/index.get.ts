import { reviewListQuerySchema } from '#server/schemas/administration'
import { reviewManagementService } from '#server/services/reviewManagementService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { page, pageSize, ...filter } = await getValidatedQuery(event, reviewListQuerySchema.parse)
    return reviewManagementService.list(filter, page, pageSize)
})
