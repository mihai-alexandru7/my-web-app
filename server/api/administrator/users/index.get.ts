import { userListQuerySchema } from '../../../schemas/administrator'
import { userManagementService } from '../../../services/userManagementService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { page, pageSize, ...filter } = await getValidatedQuery(event, userListQuerySchema.parse)
    return userManagementService.list(filter, page, pageSize)
})
