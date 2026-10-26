import { idParamSchema, userStatusSchema } from '#server/schemas/administration'
import { userManagementService } from '#server/services/userManagementService'

export default defineEventHandler(async (event) => {
    const administrator = await requireRole(event, 'administrator')
    const { id } = validatedParams(event, idParamSchema)
    const { isActive } = await validatedBody(event, userStatusSchema)
    return { user: await userManagementService.setActive(id, isActive, administrator.id) }
})
