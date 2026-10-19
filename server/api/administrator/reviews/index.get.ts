import { reviewListQuerySchema } from '../../../schemas/administrator'
import { reviewModerationService } from '../../../services/reviewModerationService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { page, pageSize, ...filter } = await getValidatedQuery(event, reviewListQuerySchema.parse)
    return reviewModerationService.list(filter, page, pageSize)
})
