import { idParamSchema } from '#server/schemas/administration'
import { bookManagementService } from '#server/services/bookManagementService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    return { book: await bookManagementService.getDetail(id) }
})
