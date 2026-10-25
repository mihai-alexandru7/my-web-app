import { idParamSchema, userStatusSchema } from '#server/schemas/administration'
import { userManagementService } from '#server/services/userManagementService'

export default defineEventHandler(async (event) => {
    const administrator = await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    const { isActive } = await readValidatedBody(event, userStatusSchema.parse)
    return { user: await userManagementService.setActive(id, isActive, administrator.id) }
})
