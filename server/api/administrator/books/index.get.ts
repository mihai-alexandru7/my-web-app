import { bookListQuerySchema } from '../../../schemas/administrator'
import { bookModerationService } from '../../../services/bookModerationService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { status, page, pageSize } = await getValidatedQuery(event, bookListQuerySchema.parse)
    return bookModerationService.list(status, page, pageSize)
})
