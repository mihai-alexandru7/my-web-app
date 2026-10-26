import { userListQuerySchema } from '#server/schemas/administration'
import { userManagementService } from '#server/services/userManagementService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { page, pageSize, ...filter } = validatedQuery(event, userListQuerySchema)
    return userManagementService.list(filter, page, pageSize)
})
