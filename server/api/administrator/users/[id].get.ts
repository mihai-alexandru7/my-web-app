import { idParamSchema } from '../../../schemas/administrator'
import { userManagementService } from '../../../services/userManagementService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    return { user: await userManagementService.getDetail(id) }
})
