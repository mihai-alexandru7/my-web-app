import { idParamSchema } from '../../../schemas/administrator'
import { bookModerationService } from '../../../services/bookModerationService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    return { book: await bookModerationService.getDetail(id) }
})
